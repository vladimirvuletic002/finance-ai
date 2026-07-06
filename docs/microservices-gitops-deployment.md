# Microservices GitOps: Automated Promotion, Progressive Delivery, Rollback & Backup/Restore

> **Purpose.** A literature review of four reference books on microservices, GitOps and
> automated provisioning/deployment; a justified design decision; and a documented,
> reproducible procedure for **fully automated promotion of a new microservice version to
> production with a gradual old→new transition, rollback, and backup/restore of multiple
> services from archives** — explicitly addressing **Docker** and **Kubernetes**.
>
> **Scope note.** This is a *reference architecture and runbook*, not something currently
> applied to `finance-ai`. The app today is a small Docker-Compose stack (see §4). Following
> Newman's own advice, full Kubernetes + GitOps is framed as the **scale-up target**, with
> lighter interim options called out.

**Sources cited (short names used throughout):**

| Short name | Book |
|---|---|
| **Newman** | Sam Newman, *Building Microservices*, 2nd ed. (O'Reilly) |
| **Richardson/NGINX** | Chris Richardson, *Microservices: From Design to Deployment* (NGINX/O'Reilly) |
| **UaR** | Ronnie Mitra & Irakli Nadareishvili, *Microservices: Up and Running* (O'Reilly) |
| **Cookbook** | Alex Soto & Natale Vinto, *GitOps Cookbook* (Red Hat / O'Reilly) |

---

## 1. Literature review

Organized by theme rather than book-by-book, because the four sources form a layered stack:
Newman gives the *principles*, Richardson gives the *historical taxonomy*, the Cookbook gives the
*GitOps paradigm + concrete Kubernetes mechanics*, and UaR gives an *end-to-end reference build*.

### 1.1 Deployment principles (the foundation) — Newman Ch. 8

Newman defines five principles of microservice deployment (Newman Ch. 8, pp. 288–299):

1. **Isolated execution** — each instance gets its own ring-fenced resources so one service
   can't starve another. Newman argues **containers are now the default** isolation unit:
   isolation is "good enough," cheap, and fast to provision versus dedicated machines/VMs
   (Newman p. 292).
2. **Focus on automation** — as service count grows, manual ops don't scale; automation is a
   cultural choice, not just tooling (case studies: REA, Gilt — Newman pp. 293–294).
3. **Infrastructure as Code (IaC)** — infrastructure defined declaratively, version-controlled,
   testable, repeatable; environments can be recreated at will (Newman pp. 294–295).
4. **Zero-downtime deployment** — deploying a new version should be invisible to upstream
   consumers. Rolling upgrades (Kubernetes) or blue-green make this achievable (Newman pp. 295–296).
5. **Desired-state management** — you declare the target state (replicas, CPU/mem) and the
   platform continuously maintains it, replacing dead instances automatically. **This is exactly
   what Kubernetes provides** (Newman pp. 296–298).

### 1.2 Deployment-pattern taxonomy / historical evolution — Richardson/NGINX Ch. 6

Richardson catalogues the evolution of deployment patterns (Richardson/NGINX Ch. 6, pp. 55–62):

- **Multiple Service Instances per Host** — traditional, efficient, fast, but **little/no
  isolation** (a misbehaving instance can consume the whole host) and ops must know each
  service's specifics (pp. 56–57).
- **Service Instance per VM** — strong isolation (Netflix packaged services as EC2 AMIs), but
  heavier and slower (pp. 58–59).
- **Service Instance per Container** — the modern sweet spot: isolation close to VMs, far cheaper
  and faster (pp. 60–61).
- **Serverless** — no server management, but constraints on runtime/state (p. 62).

This evolution justifies the modern baseline: **containers + an orchestrator**. It aligns exactly
with Newman's "containers are my default" (Newman p. 292).

### 1.3 GitOps as the delivery paradigm — Cookbook Ch. 1

GitOps is defined as **Git as the single source of truth for declarative desired state**, applying
DevOps culture as a concrete framework (Cookbook Ch. 1, pp. 19–23). The **four OpenGitOps
principles**:

1. **Declarative** — the whole system's desired state is expressed declaratively.
2. **Versioned and immutable** — state stored with full version history, enforcing immutability.
3. **Pulled automatically** — software agents pull the desired state from the source.
4. **Continuously reconciled** — agents continuously observe actual state and drive it toward
   desired state (drift correction).

The **GitOps loop** = **deploy → monitor → detect drift → take action** (Cookbook p. 22), typically
using a **two-repository model**: one repo for app source, one for Kubernetes manifests (Cookbook
pp. 22–23). GitOps directly *operationalizes* Newman's IaC + desired-state principles and adds
auditability (every change is a reviewable Git commit) and drift detection.

### 1.4 An end-to-end reference implementation — UaR Ch. 6, 7, 10, 11

UaR builds a full platform: an **IaC pipeline** with immutable infrastructure, CI/CD and Terraform
(Ch. 6); a **Kubernetes** cluster with **Argo CD as the GitOps deployment server** (Ch. 7); and a
release flow of **Docker image → registry → Helm chart/manifests → Argo CD sync** (Ch. 10,
pp. 255–260). Argo CD watches the manifests repo, compares declared vs running state, and
synchronizes (UaR pp. 255–258).

UaR Ch. 11 "Managing Change" frames change through four costs — **implementation time,
coordination time, downtime, consumer impact** (pp. 265–266) — and presents **three deployment
patterns** (pp. 266–268):

- **Blue-green** — two parallel environments (live + idle); apply change to idle, switch traffic,
  roles swap. Near-zero downtime, but **persistent data needs careful handling** (synchronized,
  replicated, or kept outside the swap) (p. 266). A *phoenix* variant recreates the idle
  environment from IaC each time instead of keeping it idling (p. 271).
- **Canary** — release the new version alongside the old and route a growing slice of traffic to
  it (by percentage or by header) until promoted; finer-grained than blue-green, smaller blast
  radius, but needs traffic management and care with shared resources (pp. 266–267).
- **Multiple versions** — explicitly version a component/interface and let clients choose, so
  incompatible versions coexist; used when breaking an API would otherwise force coordinated
  client migrations (Salesforce keeps ~19 versions live). Cost: every live version must be
  maintained, documented and secured (pp. 267–268).

### 1.5 Progressive delivery — the crux — Newman Ch. 8 (pp. 340–345)

The unifying idea is **separating deployment from release** (Jez Humble): *deployment* installs a
version into an environment; *release* makes it visible to users (Newman p. 341). James Governor's
definition: progressive delivery = **"continuous delivery with fine-grained control over the blast
radius"** (Newman p. 342). Techniques:

- **Blue-green** — the simplest embodiment of deploy-≠-release (Newman p. 341).
- **Feature toggles/flags** — hide deployed functionality behind a switch; can be per-user to
  implement canaries (Newman pp. 342–343).
- **Canary release** — a limited subset of users see the new version; ramp up while watching error
  rates/bug reports. **Modern canaries are automated on metrics** (e.g. Spinnaker/Argo Rollouts
  auto-ramp when error rates are acceptable) rather than manual (Newman pp. 343–344).
- **Parallel run** — run old and new implementations side by side for the *same* request and
  compare, with one as source of truth (Newman pp. 344–345).

### 1.6 Concrete progressive-delivery mechanics on Kubernetes — Cookbook Ch. 7–8

- **Argo CD auto-sync** (Cookbook §7.2, pp. 180–184): `syncPolicy.automated` applies manifest
  changes automatically. Two conservative safety toggles: **`prune`** (delete resources removed
  from Git) and **`selfHeal`** (revert manual drift in the cluster back to Git). Both default off;
  the doc explains when to enable each.
- **Argo CD Image Updater** (Cookbook §7.5) — can bump image tags automatically.
- **Argo Rollouts** (Cookbook §8.6, pp. 208–214): Kubernetes has **no native** advanced
  deployment; Argo Rollouts adds a **`Rollout` custom resource** (a superset of `Deployment`)
  supporting **canary and blue-green** with `strategy.canary.steps` (`setWeight`, `pause`,
  `pause:{duration}`), a manual **`promote`** gate, and **`revisionHistoryLimit`** (keeps the
  stable ReplicaSet for rollback). Traffic control is either **pod-ratio** (simple) or
  **real traffic routing via Istio** (Argo Rollouts updates the `VirtualService` weights
  automatically, using distinct stable/canary Services) (pp. 211–214). It integrates with
  Prometheus/Datadog/New Relic for **automated analysis** to drive/abort the rollout.

### 1.7 Rollback

Multiple, complementary layers appear across the sources:

- **GitOps-native rollback = `git revert` + reconcile** — the auditable source-of-truth path;
  reverting the manifests commit makes Argo CD sync back to the previous state (Cookbook §7.1,
  p. 180).
- **Platform rollback** — Argo CD history / `kubectl argo rollouts undo`; Argo Rollouts **abort**
  snaps traffic back to the retained stable ReplicaSet.
- **API-compatibility rollback strategy** — for breaking interface changes, Newman's options:
  **coexist incompatible versions** and **emulate the old interface** (Newman Ch. 5, pp. 190–197);
  UaR's **multiple versions** pattern is the consumer-facing form of the same idea.

### 1.8 Backup / restore of multiple services from archives — Newman Ch. 11 (pp. 451–453)

With automated, IaC-driven deployment you **do not back up whole machines** — the infrastructure
is *rebuilt from source*. Backups therefore target the **valuable state**: databases and
application logs (Newman pp. 451–452). Key guidance:

- **Avoid the "Schrödinger backup"** — a backup you have never restored may or may not be a backup.
  **Restore regularly to verify** (e.g. use production backups to build performance-test data)
  (Newman p. 452).
- **Isolate backups** — store them separately from the production system (separate account, and
  ideally separate region/provider) so a compromise of production doesn't also destroy the backups
  (Newman p. 452).
- **Rebuild = automation quality × backup-restore quality** — if each service can be redeployed
  from source control *and* its data restored from a solid backup process, recovery becomes a
  **non-event**; doing it routinely (as every container deploy already does) keeps the muscle warm.
  Caveat: can you also rebuild the **platform/cluster** itself from scratch? (Newman pp. 452–453).
- **Data + progressive delivery interaction** — UaR stresses blue-green/canary **require careful
  handling of persistent data**: it must be synchronized/replicated or kept outside the swap
  (UaR p. 266). This motivates **expand-contract (backward-compatible) migrations** so old and new
  versions can read/write the same schema during the transition.

### 1.9 Deployment-pattern comparison

Synthesized from UaR Ch. 11 and Newman Ch. 8:

| Pattern | Downtime | Blast radius | Infra cost | Data handling | Rollback speed | Best-fit use |
|---|---|---|---|---|---|---|
| **Rolling update** (native K8s) | Zero | Whole service, gradually | 1× (+surge) | Easy (single env) | Medium (`rollout undo`) | Default for internal, backward-compatible changes |
| **Blue-green** | Zero | All-or-nothing at switch | ~2× during switch | Hard (sync/replicate) | Instant (switch back) | Risky releases needing an instant full cutover/rollback |
| **Canary** (Argo Rollouts) | Zero | Small, % of traffic | ~1× (+small surge) | Medium (versions coexist) | Fast (abort → stable) | Fine-grained, metric-gated production validation |
| **Multiple versions** | Zero | Isolated per version | N× versions maintained | Medium/Hard | N/A (clients pick) | Breaking API changes with independent consumers |

---

## 2. Implementation directions and the justified decision

### Directions considered

- **Direction A — Plain Kubernetes rolling update.** `Deployment` with `RollingUpdate` +
  `kubectl rollout undo`. Simplest, zero-downtime, but **no traffic-percentage control, no
  metric-gated promotion, coarse rollback** (Newman notes rolling upgrades as the K8s baseline,
  p. 296).
- **Direction B — Blue-green.** Two environments, switch traffic. Zero-downtime and instant
  rollback, but **~2× resources** and **heavy persistent-data handling** (UaR pp. 266, 271).
- **Direction C — GitOps + progressive delivery *(CHOSEN)*.** **Argo CD** (pull-based reconcile
  from a Git manifests repo) + **Argo Rollouts** (`Rollout` CR: canary with `setWeight`/`pause`,
  or blue-green), **GitHub Actions** CI (build → scan → push image → bump image tag in the
  manifests repo), **Kustomize** overlays per environment. Rollback = `git revert` + reconcile
  and/or Rollouts abort/undo. Backup/restore via **Velero + isolated DB dumps**.

### Justification

Direction C is the **only** option that satisfies **all** of Newman's five principles *and* the
four OpenGitOps principles simultaneously:

- *Automation + IaC + desired-state + zero-downtime* (Newman) — all provided by Kubernetes +
  Argo CD + Argo Rollouts.
- *Declarative + versioned/immutable + pulled + continuously reconciled* (OpenGitOps) — Argo CD's
  reconcile loop with drift detection.
- It delivers Governor's **"fine-grained control of the blast radius,"** **metric-gated automated
  promotion** (Newman p. 344), and **Git-as-source-of-truth rollback** (Cookbook §7.1).
- It is precisely the stack the two O'Reilly implementation books **converge on independently**
  (UaR Ch. 7/10 → Argo CD; Cookbook Ch. 7–8 → Argo CD + Argo Rollouts), which is strong evidence
  of it being the industry-standard shape.

**Honest caveat (Newman pp. 296, 340).** For a handful of services and developers, full Kubernetes
+ Argo is likely **overkill**. So this document is the *scale-up reference architecture*. The
lighter interim ladder is: **Docker Compose (today) → managed Kubernetes + rolling update
(Direction A) → add Argo CD (GitOps) → add Argo Rollouts (progressive delivery, Direction C).**
Each rung is independently valuable.

---

## 3. Documented procedure (Docker + Kubernetes)

A reproducible runbook. Assumes a managed Kubernetes cluster (EKS/GKE/AKS) — Newman recommends a
**fully managed** cluster over self-managed (Newman p. 339).

### 3a. Containerization (Docker)

- **Multi-stage build** per service; final image runs as a **non-root** user; minimal base.
- Expose **health/readiness/liveness** endpoints so the orchestrator can do desired-state
  management and gate rollouts (UaR Ch. 9 health checks; Newman desired-state, pp. 296–298).
- **Immutable image tags = the git commit SHA** (never `latest`) — this is what makes GitOps
  diffs meaningful and rollback deterministic (OpenGitOps "versioned & immutable").
- Push to a container registry (Docker Hub / GHCR / ECR).
- *finance-ai starting point:* the existing `backend/Dockerfile` and `frontend/Dockerfile` are the
  build artifacts; production would tag them with the SHA instead of a floating tag.

### 3b. Repository model (GitOps two-repo) — Cookbook §1.4

- **App-source repo** — application code, `Dockerfile`, CI workflow.
- **Manifests repo** — Kustomize:
  ```text
  manifests/
    base/                 # Rollout, Service(s), Ingress, ConfigMap
    overlays/
      staging/            # patches: replicas, image tag, env
      prod/               # patches: replicas, image tag, env
  ```
  Argo CD watches this repo; a change here is the *only* way anything reaches a cluster.

### 3c. CI — GitHub Actions (build, scan, push, bump tag)

On merge to `main`, the app-source repo's workflow:

1. Build the image, tag = `${GITHUB_SHA}`.
2. **Scan** the image/dependencies (Snyk or GitHub code scanning) — Newman p. 451; fail the build
   on known-vulnerable libraries.
3. Push the tagged image to the registry.
4. **Commit/PR to the *manifests* repo** bumping the overlay's image tag (Cookbook §6.9/§6.10) —
   or let **Argo CD Image Updater** (§7.5) do the bump.

> **Rule: CI never `kubectl apply`s to production.** It only changes Git. CD is pull-based. This
> is the core GitOps safety property (drift detection + audit + easy revert).

Reference job skeleton (adapted from Cookbook §6, marked as a template):

```yaml
# .github/workflows/build-and-promote.yml  (app-source repo)
name: build-and-promote
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t ghcr.io/ORG/backend:${{ github.sha }} ./finance-ai/backend
      - name: Scan image
        run: echo "run snyk/trivy here; fail on high severity"
      - name: Push image
        run: |
          echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ORG --password-stdin
          docker push ghcr.io/ORG/backend:${{ github.sha }}
      - name: Bump image tag in manifests repo
        run: |
          git clone https://x-access-token:${{ secrets.MANIFESTS_TOKEN }}@github.com/ORG/manifests.git
          cd manifests
          (cd overlays/prod && kustomize edit set image backend=ghcr.io/ORG/backend:${{ github.sha }})
          git commit -am "backend ${{ github.sha }}" && git push
```

### 3d. CD — Argo CD (pull-based reconcile) — Cookbook §7.2

An `Application` points at the manifests overlay with automated sync. Enable `prune`/`selfHeal`
deliberately (both are conservative-off by default; discuss trade-offs before enabling in prod):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: finance-ai-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/ORG/manifests.git
    targetRevision: main
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: finance-ai
  syncPolicy:
    automated:
      prune: true      # delete resources removed from Git
      selfHeal: true   # revert manual cluster drift back to Git
```

Use an **`ApplicationSet`** (Cookbook §8.4) to generate one `Application` per environment/cluster
from the overlay directories, instead of hand-writing each.

### 3e. Progressive promotion — Argo Rollouts (the gradual old→new transition)

Replace the `Deployment` with a `Rollout`. Canary example (adapted from Cookbook §8.6, pp. 209–210)
with a manual gate then metric-gated automatic ramp:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: backend
spec:
  replicas: 5
  revisionHistoryLimit: 2          # keep stable ReplicaSet for fast rollback
  strategy:
    canary:
      steps:
        - setWeight: 20
        - pause: {}                # hold for a human decision (manual promote gate)
        - setWeight: 40
        - pause: {duration: 30s}
        - setWeight: 60
        - pause: {duration: 30s}
        - setWeight: 80
        - pause: {duration: 30s}
      # canaryService / stableService + trafficRouting.istio for real traffic weighting
  selector:
    matchLabels: {app: backend}
  template:
    metadata: {labels: {app: backend}}
    spec:
      containers:
        - name: backend
          image: ghcr.io/ORG/backend:REPLACED_BY_CI
```

- **Simple mode:** traffic split is approximated by **pod ratio** (Cookbook p. 212).
- **Real mode:** set `trafficRouting.istio` with distinct **stable** and **canary** Services and a
  `VirtualService`; Argo Rollouts **updates the VirtualService weights automatically** for true
  traffic-level canaries (Cookbook pp. 211–214).
- **Automated promotion:** attach an `AnalysisTemplate` (Prometheus success-rate/latency) so the
  rollout **auto-promotes on healthy metrics and auto-aborts on bad ones** (Newman p. 344).
- **Blue-green alternative:** `strategy.blueGreen` with `activeService`/`previewService` for an
  instant full cutover.

### 3f. Rollback (three layers, fast → durable)

1. **Argo Rollouts abort** — automatic on failed analysis, or `kubectl argo rollouts abort backend`;
   traffic snaps back to the retained **stable ReplicaSet** (from `revisionHistoryLimit`).
2. **Platform undo** — `kubectl argo rollouts undo backend` / Argo CD history rollback.
3. **GitOps rollback (source of truth)** — `git revert` the image-tag-bump commit in the manifests
   repo; Argo CD reconciles the cluster back to the previous version (Cookbook §7.1, p. 180).
   Auditable and durable.

**Data/schema caveat.** During a gradual transition old and new run concurrently, so schema changes
**must be backward-compatible** — use **expand-contract migrations** (add columns/tables first,
deploy code that tolerates both, contract later). This is the operational form of UaR's "multiple
versions" and Newman's "avoid breaking changes / emulate the old interface" (Newman Ch. 5,
pp. 190–197). Without it, rollback of code without rollback of schema will fail.

### 3g. Backup / restore of multiple services from archives

Two tiers (Newman Ch. 11, pp. 451–453; UaR p. 266):

**Cluster/manifest tier — rebuildable from Git.**
- Cluster provisioned by **IaC** (Terraform); all workloads declared in the manifests repo.
- Optionally run **Velero** for cluster-object + PersistentVolume snapshots, so many services'
  Kubernetes state can be restored at once. Velero backups scheduled and stored in isolated object
  storage.

**Data tier — the valuable state.**
- Scheduled **database dumps / volume snapshots** per service database.
- Stored **isolated** from production (separate cloud account, ideally different region/provider) —
  Newman p. 452.
- **Regular restore drills** to defeat the Schrödinger backup; wire a periodic restore-to-a-scratch-
  environment into CI/cron and assert health.

**Multi-service restore runbook (disaster recovery):**
1. Reprovision the cluster from **IaC** (Terraform apply).
2. Install Argo CD; point it at the manifests repo. Argo CD **reconciles all `Application`s** →
   every service redeploys from Git automatically.
3. Restore **database archives** (and Velero PV snapshots if used) into the new cluster.
4. **Verify** via each service's health/readiness endpoints and a smoke test; only then shift
   traffic. This is "restore-to-verify" made routine (Newman p. 452).

### 3h. How this maps to finance-ai specifically

Today `finance-ai` is a two-service **Docker Compose** stack (`docker-compose.yml`) — a Node/ESM
backend and a React/Nginx frontend — plus PostgreSQL, with per-service `Dockerfile`/`Dockerfile.dev`
and **no** Kubernetes/CI/GitOps yet.

**Target end-state (reference, not yet applied):** backend, frontend and Postgres as workloads in a
managed Kubernetes cluster; backend and frontend managed as **Argo Rollouts `Rollout`s** behind
**Argo CD**, promoted via canary and rolled back via `git revert`; Postgres backed up via isolated
dumps with periodic restore drills.

**But** — per Newman (pp. 296, 340) and consistent with this repo's existing `CLAUDE.md` scaling
notes (in-process fire-and-forget, in-memory rate limiting, "defer real infra until usage grows") —
at the current MVP/portfolio scale this full stack is **overkill**. Treat it as the **growth-path
reference**: adopt rung-by-rung (Compose → managed K8s rolling update → Argo CD → Argo Rollouts)
only when service count and deploy frequency justify it.

---

## References (by section)

- Newman, *Building Microservices* 2nd ed. — Ch. 5 (managing breaking changes, pp. 190–197);
  Ch. 8 Deployment: principles pp. 288–299, Kubernetes pp. 328–340, Progressive Delivery
  pp. 340–345; Ch. 11 Security: Backups & Rebuild pp. 451–453.
- Richardson, *Microservices: From Design to Deployment* — Ch. 6 deployment patterns, pp. 55–62.
- Mitra & Nadareishvili, *Microservices: Up and Running* — Ch. 6–7 (IaC pipeline, Kubernetes,
  Argo CD), Ch. 10 (release via Argo CD, pp. 255–260), Ch. 11 (three deployment patterns,
  pp. 266–271).
- Soto & Vinto, *GitOps Cookbook* — Ch. 1 (GitOps + OpenGitOps + loop, pp. 19–23); Ch. 6 (Tekton /
  GitHub Actions CI, manifest-bump recipes §6.9–6.12); Ch. 7 (Argo CD: §7.1 deploy/revert, §7.2
  auto-sync/prune/self-heal, §7.5 Image Updater); Ch. 8 (§8.4 ApplicationSet/multi-cluster, §8.6
  Argo Rollouts canary/blue-green + Istio, pp. 208–214).
