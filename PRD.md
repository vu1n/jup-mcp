PRD: MCP Server for jup.ag API
Version: 1.0

1. Product overview
1.1 Document title and version
* PRD: MCP Server for jup.ag API
* Version: 1.0

1.2 Product summary
This document outlines the requirements for developing an open-source MCP (Model Context Protocol) server that acts as an intermediary for interacting with the jup.ag API. The goal of this project is to provide a standardized and simplified way for developers to access and utilize various functionalities offered by jup.ag, including its Ultra, Swap, Token, Price, Trigger, and Recurring APIs. This server will be designed to be deployable both locally for development and testing, and on cloud platforms like Cloudflare for production use cases. A comprehensive README and a Makefile will be crucial for ensuring a smooth and efficient setup and usage experience for the developer community.

2. Goals
2.1 Business goals
* Foster a community of developers building on the jup.ag ecosystem by providing an easy-to-use interface.
* Increase the adoption and utilization of the jup.ag API by simplifying its integration process.
* Establish a reference implementation for interacting with the jup.ag API using the MCP standard.
* Encourage contributions and extensions from the open-source community to expand the server's capabilities.

2.2 User goals
* Easily access and integrate with all the specified jup.ag APIs through a consistent MCP interface.
* Run the MCP server locally for development and testing purposes.
* Deploy the MCP server to cloud platforms like Cloudflare with minimal configuration.
* Quickly set up and run the server using provided instructions and tooling (Makefile).
* Understand how to interact with the server through clear documentation in the README.

2.3 Non-goals
* Providing a graphical user interface (GUI) for interacting with the jup.ag API.
* Implementing caching mechanisms within the MCP server beyond basic request handling.
* Supporting jup.ag APIs not explicitly listed in the requirements.
* Creating a full-fledged SDK or client library in multiple programming languages (the focus is on the server).

3. User personas
3.1 Key user types
* Solana Developers
* Web3 Enthusiasts
* Integration Developers

3.2 Basic persona details
Solana Developers: Developers building decentralized applications (dApps) on the Solana blockchain who need to integrate with jup.ag's services for swaps, token information, pricing, and advanced order types.
Web3 Enthusiasts: Individuals interested in exploring and interacting with DeFi protocols on Solana through a standardized interface for educational or personal projects.
Integration Developers: Developers working on platforms or tools that need to pull data or execute actions through the jup.ag API in a consistent and reliable manner.

3.3 Role-based access
* **Users**: Can interact with the deployed MCP server to access the functionalities of the supported jup.ag APIs. No authentication required for basic usage, but potential future enhancements might introduce API key management on the jup.ag side.

4. Functional requirements
* Serve requests for Ultra API functionalities (Priority: High)
    * Allow users to request quote information for token swaps.
    * Allow users to execute token swaps.
    * Support all relevant parameters as defined in the jup.ag Ultra API documentation.
* Serve requests for Swap API functionalities (Priority: High)
    * Allow users to retrieve supported tokens and their metadata.
    * Allow users to retrieve recent swap transactions.
    * Support all relevant parameters as defined in the jup.ag Swap API documentation.
* Serve requests for Token API functionalities (Priority: High)
    * Allow users to retrieve detailed information about specific tokens.
    * Support fetching token lists.
    * Support all relevant parameters as defined in the jup.ag Token API documentation.
* Serve requests for Price API functionalities (Priority: High)
    * Allow users to fetch the current price of specified tokens.
    * Support querying prices for multiple token pairs.
    * Support all relevant parameters as defined in the jup.ag Price API documentation.
* Serve requests for Trigger API functionalities (Priority: Medium)
    * Allow users to create and manage trigger orders (e.g., limit orders).
    * Allow users to retrieve their active trigger orders.
    * Support all relevant parameters as defined in the jup.ag Trigger API documentation.
* Serve requests for Recurring API functionalities (Priority: Medium)
    * Allow users to create and manage recurring payment orders.
    * Allow users to retrieve their active recurring payment orders.
    * Support all relevant parameters as defined in the jup.ag Recurring API documentation.
* Run locally (Priority: High)
    * Provide instructions in the README for running the server on a local machine.
* Deploy to Cloudflare (Priority: High)
    * Include guidance in the README on how to deploy the server to Cloudflare Workers or similar services.
* Provide a Makefile (Priority: High)
    * Include targets in the Makefile for common development tasks such as building, running locally, and potentially deploying.
* Comprehensive README (Priority: High)
    * The README should include:
        * An overview of the project and its purpose.
        * Instructions on how to set up the development environment.
        * Instructions on how to run the server locally.
        * Instructions on how to deploy to Cloudflare (or other platforms).
        * Examples of how to interact with the server for each supported jup.ag API.
        * Information on the MCP protocol and how it's used in this project.

5. User experience
5.1. Entry points & first-time user flow
* Developers discover the open-source project through online searches, community recommendations, or the jup.ag developer documentation.
* They navigate to the project's repository (e.g., on GitHub).
* They read the README file to understand the project's purpose and capabilities.
* They follow the "Getting Started" section in the README, which guides them through the setup process, potentially using the Makefile.
* They run the server locally using the provided commands.
* They consult the example requests in the README to start interacting with the different jup.ag API endpoints through the MCP server.

5.2. Core experience
Interact with the Ultra API: A developer wants to get a quote for a SOL to USDC swap.
    They construct an MCP request according to the documentation, specifying the input token (SOL), output token (USDC), and amount.
        The README provides clear examples of how to format these MCP requests for different jup.ag API calls.
Interact with the Swap API: A developer wants to retrieve the list of supported tokens.
    They send an MCP request to the appropriate endpoint for fetching tokens.
        The server responds with a structured list of tokens and their relevant details, making it easy for the developer to use this information in their application.
Interact with the Token API: A developer needs detailed information about a specific token.
    They craft an MCP request with the token's address or identifier.
        The server returns the token's metadata, such as name, symbol, decimals, and potentially links to more information.
Interact with the Price API: A developer wants to get the latest price of a specific token pair.
    They send an MCP request specifying the two tokens.
        The server responds with the current price, allowing the developer to display or utilize this information in their application.
Interact with the Trigger API: A developer wants to create a limit order.
    They construct an MCP request with the necessary parameters for a limit order, such as the trigger price, input/output tokens, and amounts.
        The server forwards this request to the jup.ag Trigger API and confirms the order creation (subject to jup.ag's response).
Interact with the Recurring API: A developer wants to set up a recurring payment.
    They create an MCP request with the details of the recurring payment, including frequency, amounts, and tokens.
        The server communicates with the jup.ag Recurring API to schedule the payment (subject to jup.ag's response).

5.3. Advanced features & edge cases
* Handling rate limiting from the jup.ag API gracefully (potentially through informative error messages).
* Providing clear error responses from the MCP server when requests are malformed or parameters are invalid.
* Offering flexibility in deployment options beyond just local and Cloudflare (e.g., Dockerfile for containerization).
* Potential future support for different MCP serialization formats (initially focusing on a standard format like JSON).

5.4. UI/UX highlights
* Clear and concise documentation in the README with easy-to-understand examples.
* Simple setup process facilitated by the Makefile.
* Consistent request/response structure based on the MCP protocol.
* Informative error messages when issues arise.

6. Narrative
Alice is a Solana developer building a DeFi dashboard that needs real-time swap quotes and token prices from jup.ag. She finds this open-source MCP server project on GitHub. The clear README and the included Makefile make it incredibly easy for her to clone the repository, build the server, and run it locally within minutes. The documentation provides straightforward examples of how to format MCP requests to fetch swap quotes, token details, and current prices using the jup.ag Ultra, Token, and Price APIs respectively. Alice can now seamlessly integrate these functionalities into her dashboard by sending standardized MCP requests to her locally running server, abstracting away the complexities of directly interacting with multiple different jup.ag API endpoints.

7. Success metrics
7.1. User-centric metrics
* Number of unique developers who have cloned the repository.
* Number of unique developers who have forked the repository.
* Number of reported issues and pull requests submitted by the community.
* Positive feedback and engagement in community forums or discussions.
* Successful local setups and deployments as indicated by community engagement.

7.2. Business metrics
* Increased usage of the jup.ag API (potentially tracked through jup.ag's internal metrics).
* Growth in the number of projects and applications integrating with the jup.ag API.
* Reduction in the barrier to entry for developers wanting to build on jup.ag.

7.3. Technical metrics
* Server uptime and stability when deployed on platforms like Cloudflare.
* Response time of the MCP server for different API requests.
* Number of API errors originating from the MCP server (should be minimal).
* Code quality and adherence to best practices (measured through code reviews and static analysis).

8. Technical considerations
8.1. Integration points
* jup.ag Ultra API (HTTPS)
* jup.ag Swap API (HTTPS)
* jup.ag Token API (HTTPS)
* jup.ag Price API (HTTPS)
* jup.ag Trigger API (HTTPS)
* jup.ag Recurring API (HTTPS)
* Cloudflare Workers or similar serverless platforms (for deployment).

8.2. Data storage & privacy
* This MCP server primarily acts as a proxy and does not require persistent data storage for user data.
* All requests and responses are directly relayed to and from the jup.ag API.
* Privacy considerations are primarily handled by the jup.ag API and the platforms hosting the MCP server. The README should advise users on the privacy implications of using cloud deployment options.

8.3. Scalability & performance
* The server should be designed to handle a reasonable volume of concurrent requests.
* For Cloudflare deployment, the scalability will largely be managed by the Cloudflare Workers infrastructure.
* Performance optimization should focus on efficient request handling and minimal overhead in translating MCP requests to jup.ag API calls.

8.4. Potential challenges
* Keeping up with potential changes and updates in the jup.ag API.
* Ensuring compatibility and proper handling of all parameters and responses from the various jup.ag API endpoints.
* Addressing potential security vulnerabilities in the MCP server implementation.
* Managing contributions and maintaining the project as an open-source initiative.

9. Milestones & sequencing
9.1. Project estimate
* Medium: 4-6 weeks

9.2. Team size & composition
* Small Team: 1-2 total people
    * Product manager (part-time), 1-2 engineers

9.3. Suggested phases
* Phase 1: Core Functionality - Ultra, Swap, and Token APIs (2 weeks)
    * Key deliverables: Implementation of MCP server endpoints for Ultra, Swap, and Token APIs, basic request handling, initial README with setup and usage for these APIs, basic Makefile.
* Phase 2: Price and Local Deployment (1 week)
    * Key deliverables: Implementation of MCP server endpoint for Price API, detailed instructions in README for local setup and running, enhanced Makefile with run commands.
* Phase 3: Trigger and Recurring APIs (1.5 weeks)
    * Key deliverables: Implementation of MCP server endpoints for Trigger and Recurring APIs, update README with usage for these APIs.
* Phase 4: Cloudflare Deployment and Documentation Polish (0.5-1 week)
    * Key deliverables: Instructions in README for deploying to Cloudflare, comprehensive documentation review and updates, example MCP requests for all supported APIs.

10. User stories
### 10.1. Get swap quote

    ID: US-001
    Description: As a developer, I want to be able to get a swap quote from the jup.ag Ultra API through the MCP server so that I can display the estimated output amount to my users.
    Acceptance criteria:
        When I send a valid MCP request to the /ultra/quote endpoint with input token, output token, and amount, the server forwards the request to the jup.ag Ultra API.
        The server returns the quote response from the jup.ag Ultra API in a structured MCP response format.
        The response includes the estimated output amount.
        The server handles potential errors from the jup.ag API and returns an appropriate error message.

### 10.2. Execute token swap

    ID: US-002
    Description: As a developer, I want to be able to execute a token swap using the jup.ag Ultra API through the MCP server so that my users can perform swaps within my application.
    Acceptance criteria:
        When I send a valid MCP request to the /ultra/swap endpoint with the necessary swap parameters (including a signed transaction), the server forwards the request to the jup.ag Ultra API.
        The server returns the transaction signature or confirmation response from the jup.ag Ultra API in a structured MCP response format.
        The server handles potential errors from the jup.ag API and returns an appropriate error message.

### 10.3. Get supported tokens

    ID: US-003
    Description: As a developer, I want to be able to retrieve the list of supported tokens from the jup.ag Swap API through the MCP server so that I can provide a list of available tokens in my application.
    Acceptance criteria:
        When I send an MCP request to the /swap/tokens endpoint, the server forwards the request to the jup.ag Swap API.
        The server returns a list of supported tokens with their details (e.g., name, symbol, decimals) in a structured MCP response format.

### 10.4. Get recent swap transactions

    ID: US-004
    Description: As a developer, I want to be able to retrieve recent swap transactions from the jup.ag Swap API through the MCP server so that I can display recent activity in my application.
    Acceptance criteria:
        When I send an MCP request to the /swap/transactions endpoint with optional parameters like token addresses or time range, the server forwards the request to the jup.ag Swap API.
        The server returns a list of recent swap transactions with relevant details in a structured MCP response format.
        The server handles optional parameters correctly.

### 10.5. Get token information

    ID: US-005
    Description: As a developer, I want to be able to retrieve detailed information about a specific token from the jup.ag Token API through the MCP server so that I can display comprehensive token details to my users.
    Acceptance criteria:
        When I send an MCP request to the /token/info endpoint with a token address, the server forwards the request to the jup.ag Token API.
        The server returns detailed information about the specified token (e.g., name, symbol, decimals, mint address) in a structured MCP response format.
        If the token address is invalid, the server returns an appropriate error message.

### 10.6. Get token list

    ID: US-006
    Description: As a developer, I want to be able to retrieve a list of tokens from the jup.ag Token API through the MCP server so that I can populate token selection menus in my application.
    Acceptance criteria:
        When I send an MCP request to the /token/list endpoint, the server forwards the request to the jup.ag Token API.
        The server returns a list of tokens with basic information (e.g., name, symbol, mint address) in a structured MCP response format.

### 10.7. Get token price

    ID: US-007
    Description: As a developer, I want to be able to get the current price of a token pair from the jup.ag Price API through the MCP server so that I can display real-time prices in my application.
    Acceptance criteria:
        When I send an MCP request to the /price endpoint specifying two token addresses, the server forwards the request to the jup.ag Price API.
        The server returns the current price of the specified token pair in a structured MCP response format.
        If the token addresses are invalid, the server returns an appropriate error message.

### 10.8. Create trigger order

    ID: US-008
    Description: As a developer, I want to be able to create a trigger order (e.g., limit order) using the jup.ag Trigger API through the MCP server so that my users can automate trades based on price conditions.
    Acceptance criteria:
        When I send a valid MCP request to the /trigger/create endpoint with the necessary trigger order parameters (including a signed transaction), the server forwards the request to the jup.ag Trigger API.
        The server returns the trigger order ID or confirmation response from the jup.ag Trigger API in a structured MCP response format.
        The server handles potential errors from the jup.ag API and returns an appropriate error message.

### 10.9. Get active trigger orders

    ID: US-009
    Description: As a developer, I want to be able to retrieve my active trigger orders from the jup.ag Trigger API through the MCP server so that my users can view and manage their pending automated trades.
    Acceptance criteria:
        When I send an MCP request to the /trigger/list endpoint, the server forwards the request to the jup.ag Trigger API (potentially requiring user identification in future enhancements, but currently assuming publicly available data or no authentication needed for this initial phase).
        The server returns a list of active trigger orders with relevant details in a structured MCP response format.

### 10.10. Create recurring payment

    ID: US-010
    Description: As a developer, I want to be able to create a recurring payment order using the jup.ag Recurring API through the MCP server so that my users can set up automated periodic payments.
    Acceptance criteria:
        When I send a valid MCP request to the /recurring/create endpoint with the necessary recurring payment parameters (including a signed transaction), the server forwards the request to the jup.ag Recurring API.
        The server returns the recurring payment order ID or confirmation response from the jup.ag Recurring API in a structured MCP response format.
        The server handles potential errors from the jup.ag API and returns an appropriate error message.

### 10.11. Get active recurring payments

    ID: US-011
    Description: As a developer, I want to be able to retrieve my active recurring payment orders from the jup.ag Recurring API through the MCP server so that my users can view and manage their scheduled payments.
    Acceptance criteria:
        When I send an MCP request to the /recurring/list endpoint, the server forwards the request to the jup.ag Recurring API (potentially requiring user identification in future enhancements, but currently assuming publicly available data or no authentication needed for this initial phase).
        The server returns a list of active recurring payment orders with relevant details in a structured MCP response format.

### 10.12. Run server locally

    ID: US-012
    Description: As a developer, I want to be able to run the MCP server on my local machine so that I can develop and test my application.
    Acceptance criteria:
        The README provides clear and concise instructions on how to install dependencies and run the server locally.
        The Makefile includes a command to easily start the local development server.
        When I follow the instructions, I can successfully start the MCP server on my local machine and it is accessible (e.g., via localhost on a specific port).

### 10.13. Deploy server to Cloudflare

    ID: US-013
    Description: As a developer, I want to be able to deploy the MCP server to Cloudflare Workers so that I can make it publicly accessible and scalable.
    Acceptance criteria:
        The README provides clear and concise instructions on how to deploy the server to Cloudflare Workers (or a similar platform).
        The instructions include steps for setting up any necessary Cloudflare configurations.
        After following the instructions, the MCP server is successfully deployed and accessible via a Cloudflare-provided URL.

### 10.14. Understand project purpose

    ID: US-014
    Description: As a developer, I want to understand the purpose and capabilities of this MCP server project so that I can determine if it meets my needs.
    Acceptance criteria:
        The README provides a clear and concise overview of the project, its goals, and the jup.ag APIs it supports.
        The README explains the concept of MCP in the context of this project.

### 10.15. Set up development environment

    ID: US-015
    Description: As a developer, I want to be able to easily set up my development environment for contributing to this project.
    Acceptance criteria:
        The README includes instructions on how to clone the repository and install any necessary development dependencies.
        The Makefile includes commands for common development tasks like building and testing (if applicable in the initial phase).