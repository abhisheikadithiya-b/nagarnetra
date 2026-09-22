# NagarNetra Data Retention & Privacy Policy
*Compliant with the Digital Personal Data Protection (DPDP) Act 2023 & Municipal Optical Data Agreements*

## 1. Core Principles
1. **Edge-Only Raw Processing**: Full-resolution raw video footage never leaves the physical BMTC bus.
2. **Volatile RAM Anonymization**: Bounding boxes for bystander faces and non-infringing vehicle license plates are blurred inside volatile device RAM before an evidence snapshot is encoded.
3. **Bandwidth & Storage Budget**: Visual evidence is capped at 15–20 KB JPEG snapshots watermarked with cryptographic compliance hashes.

---

## 2. Retention Schedules

| Data Tier | Location | Retention Period | Purge Mechanism | Legal Basis |
| :--- | :--- | :--- | :--- | :--- |
| **Edge Video Ring Buffer** | Phone RAM | 10 Seconds | Overwritten in circular buffer | DPDP Act Sec 8(1) |
| **Edge Queued Events** | Phone IndexedDB | 24 Hours | Auto-pruned after HTTP acknowledgment | Storage minimization |
| **High-Res Incident Crops** | Central Evidence Store | 90 Days | Archived to cold storage after ticket closure | Municipal Infra Audit |
| **Telemetry & GPS Pings** | PostGIS / TimeSeries | 365 Days | Downsampled to hourly aggregate | Traffic Planning & OD Analysis |
| **Work Order Records** | PostgreSQL Relational | 7 Years | Permanent compliance archive | PWD Public Audit Mandate |
| **Audit Logs** | Append-Only Table | 3 Years | Read-only compliance audit trail | ISO 27001 Security |

---

## 3. Citizen Privacy & Law Enforcement Requests
- **License Plate Identification**: ANPR optical character recognition runs strictly upon trigger conditions (e.g. unauthorized tempo blocking bus-only lane). Non-infringing vehicles are subjected to irreversible pixelation.
- **Right to Erasure**: Citizens may submit geolocation-timestamp queries to the Data Protection Officer (`dpo@nagarnetra.bengaluru.gov.in`) to verify data obfuscation.
