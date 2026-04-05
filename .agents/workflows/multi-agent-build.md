---
description: Launch 5 parallel opencode agents to complete HomeHarvest app
---

# Multi-Agent Build Workflow

This workflow launches 5 opencode instances in parallel, each working on a separate area of the HomeHarvest app.

## Prerequisites
- opencode CLI installed (`opencode --version`)
- Project at `c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest`
- `node_modules` installed (`npm install`)

## Agent Task Files
Each agent reads from `.agents/tasks/`:
1. `agent-1-ai-delivery.md` — AI delivery + missing API routes
2. `agent-2-product-detail.md` — Product detail page + reviews
3. `agent-3-vendor-orders.md` — Vendor order status updates
4. `agent-4-admin-notifications.md` — Admin panel + notifications
5. `agent-5-footer-ui-tests.md` — Footer, UI components, tests

## Launch Commands

// turbo-all

1. Launch Agent 1 (AI Delivery):
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest'; opencode"
```
Then paste: `Read the file .agents/tasks/agent-1-ai-delivery.md and complete ALL tasks described in it. Follow the AGENTS.md coding conventions.`

2. Launch Agent 2 (Product Detail):
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest'; opencode"
```
Then paste: `Read the file .agents/tasks/agent-2-product-detail.md and complete ALL tasks described in it. Follow the AGENTS.md coding conventions.`

3. Launch Agent 3 (Vendor Orders):
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest'; opencode"
```
Then paste: `Read the file .agents/tasks/agent-3-vendor-orders.md and complete ALL tasks described in it. Follow the AGENTS.md coding conventions.`

4. Launch Agent 4 (Admin + Notifications):
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest'; opencode"
```
Then paste: `Read the file .agents/tasks/agent-4-admin-notifications.md and complete ALL tasks described in it. Follow the AGENTS.md coding conventions.`

5. Launch Agent 5 (Footer + UI + Tests):
```powershell
Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd 'c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest'; opencode"
```
Then paste: `Read the file .agents/tasks/agent-5-footer-ui-tests.md and complete ALL tasks described in it. Follow the AGENTS.md coding conventions.`

## Post-Completion
After all agents finish, run:
```bash
cd c:\Users\TejasRanjith\Desktop\HomeHarvest\home-harvest
npm run type-check && npm run lint
npm run test
npm run build
```
