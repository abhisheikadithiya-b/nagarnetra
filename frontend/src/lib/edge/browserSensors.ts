/**
 * NagarNetra Edge - Browser Capability & Sensor Abstraction Layer
 * Interfaces with genuine HTML5 hardware APIs (Camera, Geolocation, DeviceMotion)
 * and falls back to deterministic simulation when unavailable, clearly communicating state.
 */

export interface SensorStatus {
  camera: 'granted' | 'simulated' | 'denied';
  gps: 'fix' | 'simulated' | 'denied';
  imu: 'active' | 'simulated' | 'unavailable';
  gpsAccuracyM?: number;
  cameraResolution?: string;
  imuHz?: number;
}

export interface GpsCoordinate {
  lat: number;
  lon: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
  isReal: boolean;
}

export interface ImuReading {
  x: number;
  y: number;
  z: number;
  jerk: number;
  isReal: boolean;
  timestamp: number;
}

export class BrowserSensorManager {
  private mediaStream: MediaStream | null = null;
  private geoWatchId: number | null = null;
  private motionListener: ((e: DeviceMotionEvent) => void) | null = null;
  private simInterval: NodeJS.Timeout | null = null;
  private realMotionCount = 0;

  public status: SensorStatus = {
    camera: 'simulated',
    gps: 'simulated',
    imu: 'simulated',
  };

  /**
   * Request live hardware camera stream.
   * Prefers environment (rear) camera for dashboard mounting.
   */
  async requestCamera(videoElement?: HTMLVideoElement): Promise<{ stream: MediaStream | null; isReal: boolean }> {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.status.camera = 'simulated';
      return { stream: null, isReal: false };
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.mediaStream = stream;
      this.status.camera = 'granted';
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      this.status.cameraResolution = `${settings.width || 1280}x${settings.height || 720}`;

      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.play().catch(() => {});
      }

      return { stream, isReal: true };
    } catch (err) {
      console.warn('[EdgeSensor] Camera permission denied or unsupported, using simulation:', err);
      this.status.camera = 'simulated';
      return { stream: null, isReal: false };
    }
  }

  /**
   * Watch live hardware GPS or fallback to simulated Bangalore Outer Ring Road route.
   */
  startGps(callback: (coord: GpsCoordinate) => void): () => void {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      this.geoWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.status.gps = 'fix';
          this.status.gpsAccuracyM = Math.round(pos.coords.accuracy);
          callback({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            isReal: true,
          });
        },
        (err) => {
          console.warn('[EdgeSensor] GPS error, falling back to simulated track:', err.message);
          this.status.gps = 'simulated';
          this.startSimulatedGps(callback);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    } else {
      this.status.gps = 'simulated';
      this.startSimulatedGps(callback);
    }

    return () => this.stopGps();
  }

  private startSimulatedGps(callback: (coord: GpsCoordinate) => void) {
    let lat = 12.9352;
    let lon = 77.6245;
    let step = 0;

    this.simInterval = setInterval(() => {
      step += 0.0001;
      callback({
        lat: lat + Math.sin(step) * 0.005,
        lon: lon + Math.cos(step) * 0.005,
        accuracy: 3.5,
        heading: 88.0,
        speed: 9.7, // ~35 km/h
        isReal: false,
      });
    }, 1000);
  }

  stopGps() {
    if (this.geoWatchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }
    if (this.simInterval) {
      clearInterval(this.simInterval);
      this.simInterval = null;
    }
  }

  /**
   * Watch DeviceMotionEvent for 50Hz vertical z-axis road roughness (IRI vibration).
   */
  startImu(callback: (reading: ImuReading) => void): () => void {
    if (typeof window === 'undefined' || !window.DeviceMotionEvent) {
      this.status.imu = 'simulated';
      this.startSimulatedImu(callback);
      return () => {};
    }

    let lastZ = 0;
    this.motionListener = (e: DeviceMotionEvent) => {
      this.realMotionCount++;
      const z = e.accelerationIncludingGravity?.z ?? e.acceleration?.z ?? 0;
      const x = e.accelerationIncludingGravity?.x ?? e.acceleration?.x ?? 0;
      const y = e.accelerationIncludingGravity?.y ?? e.acceleration?.y ?? 0;
      const jerk = Math.abs(z - lastZ);
      lastZ = z;

      this.status.imu = 'active';
      this.status.imuHz = 50;

      callback({
        x,
        y,
        z,
        jerk,
        isReal: true,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('devicemotion', this.motionListener);

    // If no real motion events arrive within 1.5s (e.g. desktop), fallback to simulated IMU
    setTimeout(() => {
      if (this.realMotionCount < 3) {
        this.status.imu = 'simulated';
        this.startSimulatedImu(callback);
      }
    }, 1500);

    return () => {
      if (this.motionListener && typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', this.motionListener);
        this.motionListener = null;
      }
    };
  }

  private startSimulatedImu(callback: (reading: ImuReading) => void) {
    const imuTimer = setInterval(() => {
      const baseZ = 9.8; // 1G gravity
      const noise = (Math.random() - 0.5) * 0.4;
      callback({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: baseZ + noise,
        jerk: Math.abs(noise),
        isReal: false,
        timestamp: Date.now(),
      });
    }, 200);

    return () => clearInterval(imuTimer);
  }

  cleanup() {
    this.stopGps();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }
}
