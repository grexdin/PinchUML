import type { DemoScenario } from './types'

export const demos: DemoScenario[] = [
  {
    label: 'Auth flow',
    diagramType: 'sequence',
    prompt: 'Show a user logging in: the client sends credentials to an Auth service, which returns a session token.',
  },
  {
    label: 'Checkout',
    diagramType: 'activity',
    prompt: 'An e-commerce checkout: user reviews cart, pays, and the order is created. If payment fails, the user retries.',
  },
  {
    label: 'Microservices',
    diagramType: 'component',
    prompt: 'An API Gateway routes to User Service and Order Service. Each service has its own database.',
  },
  {
    label: 'Library model',
    diagramType: 'class',
    prompt: 'A library domain: Patron has many Loans. Each Loan has one Book. Show class relationships.',
  },
  {
    label: 'CI/CD',
    diagramType: 'activity',
    prompt: 'A CI/CD pipeline: push code, run tests, build, deploy to staging, then promote to production.',
  },
  {
    label: 'Deployment',
    diagramType: 'deployment',
    prompt: 'A web app across two zones, each with a load balancer and two web servers. Primary database is in zone A.',
  },
]
