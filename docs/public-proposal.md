# Louie — Unsolicited Proposal Draft

## Citation-Backed Public Record Search for Municipal Transparency and Accessibility

---

## 1. Executive Summary

Louie is a citation-backed search and retrieval platform designed to improve public and staff access to municipal council records.

The platform enables residents, councillors, clerks, and staff to search council meetings, agendas, minutes, staff reports, and related public materials using natural-language questions, while receiving responses linked directly to the underlying source material, including transcript excerpts, document sections, and meeting timestamps.

The objective is not to replace the City’s existing public record systems, but to improve discoverability, accessibility, and usability of information the City already publishes.

Louie is designed to support:

* Improved resident access to council information
* Faster retrieval of historical deliberations and decisions
* Enhanced transparency and accountability
* Accessibility-compliant public access to municipal records
* Reduced staff effort locating and cross-referencing historic material

The proposed initial deployment includes:

* ingestion of approximately 12 months of publicly available council and committee records,
* ongoing automated indexing of newly published meetings,
* a public-facing search interface,
* and a staff-facing dashboard for operational use.

Estimated implementation timeline:

* approximately 9–11 weeks from project initiation.

Commercial model:

* one-time historical ingestion/backfill fee,
* followed by annual hosted service and support pricing.

This proposal is submitted under the City of Mississauga’s unsolicited bid framework for consideration.

---

## 2. Municipal Problem Statement

Municipal council records are publicly available, but are often operationally difficult to search and navigate.

Residents, staff, councillors, journalists, and researchers frequently rely on:

* manual review of lengthy meeting recordings,
* fragmented agendas and minutes,
* keyword-limited search tools,
* and institutional knowledge held by long-serving staff.

As the volume of council records grows over time, the difficulty of locating relevant historic discussions, decisions, and supporting documents increases significantly.

Current municipal publishing systems generally provide access to records, but not semantic discoverability across:

* meeting transcripts,
* agenda items,
* staff reports,
* speakers,
* motions,
* and related discussions.

This creates challenges including:

* time-consuming retrieval of historical information,
* barriers to resident accessibility and participation,
* difficulty tracing deliberation history,
* reduced discoverability of accountability records,
* and increased operational burden on clerks and administrative staff.

Louie is intended to address these challenges by creating a citation-backed retrieval layer over the City’s existing public record infrastructure.

---

## 3. Proposed Solution

Louie is a municipal public-record search platform that indexes and retrieves information from publicly available council materials.

Residents and staff can ask natural-language questions such as:

* “When did council last discuss stormwater fees?”
* “What concerns were raised about the transit budget?”
* “Which meetings discussed the downtown parking strategy?”

Responses are generated using retrieved source material and include direct citations to:

* transcript segments,
* meeting timestamps,
* agenda items,
* minutes,
* and staff reports.

Where relevant information cannot be confidently identified in the indexed public record, the platform is designed to respond conservatively rather than presenting unsupported conclusions.

Louie does not modify the City’s official records and does not replace the City as the authoritative source of municipal information.

The platform is intended as an access and discoverability layer over records already published by the City.

---

## 4. Scope of Initial Deployment

### Historical Record Ingestion

* Ingestion of approximately 12 months of publicly available council and committee meetings
* Video/audio transcript processing
* Agenda, minutes, and staff report indexing

For a municipality the size of Mississauga, this is estimated at approximately 200 meetings annually.

### Ongoing Indexing

* Automated indexing of newly published meetings and materials
* Target indexing window within 48 hours of publication by the City

### Public Search Interface

* City-branded public search experience
* No resident login required

### Citation-Backed Responses

Responses include links to:

* transcript excerpts,
* timestamps,
* agenda items,
* and supporting documents.

### Staff Dashboard

Staff-facing interface including:

* exportable citation bundles,
* operational usage analytics,
* and administrative review tools.

### Speaker Attribution Layer

Speaker names and roles resolved against:

* publicly available municipal rosters,
* and City-reviewed configuration data where required.

---

### Excluded from Initial Deployment

The following items are intentionally excluded from the initial deployment scope:

* Re-hosting or mirroring the City’s video archive
* Real-time live meeting transcription
* Internal staff-only repository ingestion
* FOI workflow integration
* Multi-municipality comparative search
* Automated decision-making or recommendation functionality

---

## 5. Technical Architecture Overview

### Ingestion Pipeline

Publicly available municipal records are processed through an ingestion pipeline that:

* retrieves published meeting materials,
* generates structured transcript data,
* parses agendas and supporting documents,
* and indexes the material for retrieval.

### Retrieval Layer

Louie uses a retrieval-based architecture that:

* retrieves relevant source material,
* grounds responses in retrieved content,
* and verifies citation references before returning responses.

The platform is designed to prioritize verifiable retrieval over speculative or unsupported output generation.

### Versioned Record Handling

Where the City republishes or corrects source records:

* updated versions can be indexed,
* while preserving prior versions internally for auditability and change tracking where appropriate.

### Hosting Model

The proposed commercial model assumes Louie-hosted infrastructure and operations.

Alternative hosting arrangements may be scoped separately if requested by the City.

---

## 6. Privacy, Accessibility, and Compliance

### Public Record Scope

Louie is designed to ingest only records already made publicly available by the City.

The platform is not intended to ingest:

* closed-session content,
* internal correspondence,
* or non-public records.

### Privacy Posture

The platform is intended to operate in a manner consistent with MFIPPA considerations, including:

* limiting ingestion to public records,
* minimizing collection of resident personal information,
* and avoiding unnecessary user identification requirements for public access.

### AI Accountability Considerations

The platform is designed to support emerging public-sector AI accountability expectations through:

* disclosure of AI-assisted responses,
* citation-backed outputs,
* source traceability,
* and conservative refusal behaviour where sufficient supporting material is unavailable.

### Data Ownership

The City retains ownership of its public records and configuration data.

Louie retains ownership of its software platform and underlying technology.

Additional data retention, export, and deletion provisions may be defined during procurement discussions.

---

## 7. Pricing

### Historical Backfill

* Approximately $30 per historical meeting ingested

Estimated:

* approximately $6,000 for an initial 12-month Mississauga-scale ingestion.

### Ongoing Hosted Service

* Approximately $9,500 annually

Includes:

* hosting,
* ongoing indexing,
* maintenance,
* operational support,
* and platform updates.