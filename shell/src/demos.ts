import type { DemoScenario } from './types'

export const demos: DemoScenario[] = [
  {
    label: 'Auth flow',
    diagramType: 'sequence',
    prompt:
      'Show a user logging in: the client sends credentials to an Auth service, which validates a JWT token, queries a User database, and returns a session token to the client.',
  },
  {
    label: 'Order checkout',
    diagramType: 'activity',
    prompt:
      'Model an e-commerce checkout: user reviews cart, enters shipping info, selects payment method. If payment succeeds, the order is created and inventory is updated. If payment fails, the user is returned to the payment selection step.',
  },
  {
    label: 'Microservice topology',
    diagramType: 'component',
    prompt:
      'Show a microservice system with an API Gateway that routes to User Service, Order Service, and Notification Service. Each service has its own database. The Order Service publishes events to a message broker that the Notification Service consumes.',
  },
  {
    label: 'Domain model',
    diagramType: 'class',
    prompt:
      'Model a library domain: a Patron has many Loans, each Loan references one Book. A Book has an Author. Include attributes like dueDate, title, ISBN, name. Show relationships with multiplicity.',
  },
  {
    label: 'CI/CD pipeline',
    diagramType: 'activity',
    prompt:
      'Show a CI/CD pipeline: developer pushes to GitHub, which triggers a build in GitHub Actions. The build runs tests, lints, then builds a Docker image. The image is pushed to a container registry, then deployed to a staging environment. After approval, it is promoted to production.',
  },
  {
    label: 'Deployment diagram',
    diagramType: 'deployment',
    prompt:
      'Show a web application deployed across two availability zones. Each zone has a load balancer, two web server nodes, and a database replica. The primary database is in zone A. Include a CDN in front of the load balancers.',
  },
]
