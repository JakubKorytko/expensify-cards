GENERIC:

```mermaid
---
config:
  theme: dark
---
sequenceDiagram
    autonumber
    box rgba(150,66,99,1) Backend
        participant Server as Auth
    end

    box rgba(33,66,99,1) MultifactorAuthentication Library
        participant SC as Scenarios
        participant Module as Module
    end

    box rgba(99,66,33,1) App Component Stack
        participant MFACTX as MultifactorAuthenticationContext
        participant RHPRHP as RHP Navigator (Screen)
    end


    box rgba(150,150,99,1) Action trigger
        actor User
    end


    Note over MFACTX,RHPRHP: Context wraps the Navigator
    User->>RHPRHP: Navigate to relevant MFAScreen with parameters
    Note over User,RHPRHP: Trigger action (e.g. notification tap, enter relevant screen).<br />The payload (e.g. transactionID) is passed in the URL params
    User->>RHPRHP: Take action (e.g. click "Authorize" button)
    RHPRHP->>MFACTX: Run the process method with scenario & params as arguments
        Note over RHPRHP,MFACTX: The scenario is identified based on the screen navigated to
    MFACTX-->>SC: Read details related to the scenario
    SC-->>MFACTX: ;
        Note over MFACTX,SC: i.e. security level, required payload etc.
    MFACTX-->>Server: Request the biometrics challenge along with registered credentials list
    Server->>MFACTX: ;
    MFACTX-->MFACTX: Determine whether the biometrics is configured<br /> and the flow can be executed based on the scenario details, device configuration
        Note over MFACTX: This check includes only essential factors (e.g. required payload present, security level supported) <br /> It does not include user-provided factors (e.g. validateCode correctness)
    alt Flow can't be executed
        MFACTX->>RHPRHP: Navigate to the Failure Screen
    else Flow can be executed but biometrics is required and not configured
        MFACTX->>RHPRHP: Navigate to the validate code input screen
        User->>RHPRHP: Provide the validateCode value and submit
        RHPRHP->>MFACTX: Pass the validateCode value provided by the user
        MFACTX->>MFACTX: Store the validateCode value
        MFACTX->>RHPRHP: Navigate to the Soft Prompt screen
        User->>RHPRHP: Accept/reject the Soft Prompt
        RHPRHP->>MFACTX: Pass the Soft Prompt acceptance/rejection
        MFACTX->>MFACTX: Add stored validateCode & soft prompt decision to the params for the given flow
    end
    MFACTX->>Module: Pass scenario, params and challenge to the relevant module
        Note over MFACTX,Module: The module is a hook used to run the given flow (fallback/biometrics)
    loop
        Note over Module,MFACTX: This section will vary based on the selected module.<br />Details for each module in their respective release
        Module->>MFACTX: Pass the info about the required factor type
        MFACTX->>RHPRHP: Navigate to the relevant screen for the factor retrieval
        User->>RHPRHP: Provide the factor value and submit
        RHPRHP->>MFACTX: Pass the factor value provided by the user
        MFACTX->>Module: Pass the factor value
        Module-->>Server: Validate the factor/s with the backend
        Server-->>Module: ;
    end
        Note left of RHPRHP: Loop continues until all factors are validated or a failure occurs
    Module->>MFACTX: Decision based on the factors validation
    MFACTX->>RHPRHP: Navigate to the Success/Failure Screen
```

**RELEASE ONE:**

```mermaid
---
config:
  theme: dark
---
sequenceDiagram
    autonumber
    box rgba(150,66,99,1) Backend
        participant Server as Auth
    end

    box rgba(33,66,99,1) MultifactorAuthentication Library
        participant SC as Scenarios
        participant Module as Module
    end

    box rgba(99,66,33,1) App Component Stack
        participant MFACTX as MultifactorAuthenticationContext
        participant RHPRHP as RHP Navigator (Screen)
    end


    box rgba(150,150,99,1) Action trigger
        actor User
    end


    Note over MFACTX,RHPRHP: Context wraps the Navigator
    User->>RHPRHP: Navigate to the troubleshoot page
    User->>RHPRHP: Click on the "Test" button
    RHPRHP->>MFACTX: Run the process method with TEST_BIOMETRICS scenario
    MFACTX-->>SC: Read details related to the scenario
    SC-->>MFACTX: ;
        Note over MFACTX,SC: i.e. security level, required payload etc.
    MFACTX->>Module: Pass scenario to the fallback module
        Note over MFACTX,Module: The module is a hook used to run the fallback flow
    Module->>MFACTX: Pass the info that the validateCode is required
    MFACTX->>RHPRHP: Navigate to the validateCode input screen
    User->>RHPRHP: Provide the validateCode value and submit
    RHPRHP->>MFACTX: Pass the validateCode value provided by the user
    MFACTX->>Module: Pass the validateCode value
    alt 2FA is not enabled
    Module-->>Server: Validate the factor/s with the backend
    Server-->>Module: ;
    end
    Module->>MFACTX: Pass the info that the OTP/2FA code is required
    MFACTX->>RHPRHP: Navigate to the OTP/2FA code input screen
    User->>RHPRHP: Provide the OTP/2FA code value and submit
    RHPRHP->>MFACTX: Pass the OTP/2FA code value provided by the user
    MFACTX->>Module: Pass the OTP/2FA code value
    Module-->>Server: Validate the factor/s with the backend
    Server-->>Module: ;
    Module->>MFACTX: Decision based on the factors validation
    MFACTX->>RHPRHP: Navigate to the Success/Failure Screen
```

**RELEASE_TWO:**

```mermaid
---
config:
  theme: dark
---
sequenceDiagram
    autonumber
    box rgba(150,66,99,1) Backend
        participant Server as Auth
    end

    box rgba(33,66,99,1) MultifactorAuthentication Library
        participant SC as Scenarios
        participant Module as Module
    end

    box rgba(99,66,33,1) App Component Stack
        participant MFACTX as MultifactorAuthenticationContext
        participant RHPRHP as RHP Navigator (Screen)
    end


    box rgba(150,150,99,1) Action trigger
        actor User
    end


    Note over MFACTX,RHPRHP: Context wraps the Navigator
    User->>RHPRHP: Navigate to the AuthorizeTransaction screen with parameters
    Note over User,RHPRHP: Trigger action (e.g. notification tap, enter relevant screen).<br />The payload (i.e. the transactionID) is passed in the URL params
    User->>RHPRHP: Take action (i.e. click "Authorize" button)
    RHPRHP->>MFACTX: Run the process method with AUTHORIZE_TRANSACTION scenario & params as arguments
    Note over RHPRHP,MFACTX: The scenario is identified based on the screen navigated to
    MFACTX-->>SC: Read details related to the scenario
    SC-->>MFACTX: ;
        Note over MFACTX,SC: i.e. security level, required payload etc.
    MFACTX->>Module: Pass scenario to the fallback module
        Note over MFACTX,Module: The module is a hook used to run the fallback flow
    Module->>MFACTX: Pass the info that the validateCode is required
    MFACTX->>RHPRHP: Navigate to the validateCode input screen
    User->>RHPRHP: Provide the validateCode value and submit
    RHPRHP->>MFACTX: Pass the validateCode value provided by the user
    MFACTX->>Module: Pass the validateCode value
    alt 2FA is not enabled
    Module-->>Server: Validate the factor/s with the backend
    Server-->>Module: ;
    end
    Module->>MFACTX: Pass the info that the OTP/2FA code is required
    MFACTX->>RHPRHP: Navigate to the OTP/2FA code input screen
    User->>RHPRHP: Provide the OTP/2FA code value and submit
    RHPRHP->>MFACTX: Pass the OTP/2FA code value provided by the user
    MFACTX->>Module: Pass the OTP/2FA code value
    Module-->>Server: Validate the factor/s with the backend
    Server-->>Module: ;
    Module->>MFACTX: Decision based on the factors validation
    MFACTX->>RHPRHP: Navigate to the Success/Failure Screen
```

**RELEASE_THREE:**

```mermaid
---
config:
  theme: dark
---
sequenceDiagram
    autonumber
    box rgba(150,66,99,1) Backend
        participant Server as Auth
    end

    box rgba(33,66,99,1) MultifactorAuthentication Library
        participant SC as Scenarios
        participant Module as Module
    end

    box rgba(99,66,33,1) App Component Stack
        participant MFACTX as MultifactorAuthenticationContext
        participant RHPRHP as RHP Navigator (Screen)
    end


    box rgba(150,150,99,1) Action trigger
        actor User
    end


    Note over MFACTX,RHPRHP: Context wraps the Navigator
    User->>RHPRHP: Navigate to relevant MFAScreen with parameters
    Note over User,RHPRHP: Trigger action (e.g. notification tap, enter relevant screen).<br />The payload (e.g. transactionID) is passed in the URL params
    User->>RHPRHP: Take action (e.g. click "Authorize" button)
    RHPRHP->>MFACTX: Run the process method with scenario & params as arguments
        Note over RHPRHP,MFACTX: The scenario is identified based on the screen navigated to
    MFACTX-->>SC: Read details related to the scenario
    SC-->>MFACTX: ;
        Note over MFACTX,SC: i.e. security level, required payload etc.
    MFACTX-->>Server: Request the biometrics challenge along with registered credentials list
    Server->>MFACTX: ;
    MFACTX-->MFACTX: Determine whether the biometrics is configured<br /> and the flow can be executed based on the scenario details, device configuration
        Note over MFACTX: This check includes only essential factors (e.g. required payload present, security level supported) <br /> It does not include user-provided factors (e.g. validateCode correctness)
    alt Flow can't be executed
        MFACTX->>RHPRHP: Navigate to the Failure Screen
    else Flow can be executed but biometrics is required and not configured
        MFACTX->>RHPRHP: Navigate to the validate code input screen
        User->>RHPRHP: Provide the validateCode value and submit
        RHPRHP->>MFACTX: Pass the validateCode value provided by the user
        MFACTX->>MFACTX: Store the validateCode value
        MFACTX->>RHPRHP: Navigate to the Soft Prompt screen
        User->>RHPRHP: Accept/reject the Soft Prompt
        RHPRHP->>MFACTX: Pass the Soft Prompt acceptance/rejection
        MFACTX->>MFACTX: Add stored validateCode & soft prompt decision to the params for the given flow
    end
    MFACTX->>Module: Pass scenario, params and challenge to the relevant module
        Note over MFACTX,Module: The module is a hook used to run the given flow (fallback/biometrics)

    alt Soft prompt was rejected
        alt 2FA is not enabled
            Module-->>Server: Validate the factor/s with the backend
            Server-->>Module: ;
        end
            Module->>MFACTX: Pass the info that the OTP/2FA code is required
            MFACTX->>RHPRHP: Navigate to the OTP/2FA code input screen
            User->>RHPRHP: Provide the OTP/2FA code value and submit
            RHPRHP->>MFACTX: Pass the OTP/2FA code value provided by the user
            MFACTX->>Module: Pass the OTP/2FA code value
    else Soft prompt was accepted or biometrics was configured already
        Module->>User: Prompt the user for biometrics
        User->>Module: Authenticate using biometrics
        Module->>Module: Sign the challenge using private key
    end
    Module-->>Server: Validate the factor/s with the backend
    Server-->>Module: ;
        Note left of RHPRHP: Loop continues until all factors are validated or a failure occurs
    Module->>MFACTX: Decision based on the factors validation
    MFACTX->>RHPRHP: Navigate to the Success/Failure Screen
```

**RELEASE_FOUR:**

```mermaid
---
config:
  theme: dark
---
sequenceDiagram
    autonumber
    box rgba(150,66,99,1) Backend
        participant Server as Auth
    end
        
        
    box rgba(33,66,99,1) MultifactorAuthentication Library
        participant Module as Module
    end

    box rgba(99,66,33,1) App Component Stack
        participant MFACTX as MultifactorAuthenticationContext
        participant RHPRHP as RHP Navigator (Screen)
    end


    box rgba(150,150,99,1) Action trigger
        actor User
    end


    Note over MFACTX,RHPRHP: Context wraps the Navigator
    User->>RHPRHP: Navigate to the revoke MFA screen
    RHPRHP->>MFACTX: Ask if the biometrics is configured
    MFACTX-->Module: Ask module if the public key is stored locally
    Module-->MFACTX: ;
    alt Biometrics is not configured
        MFACTX->>RHPRHP: Navigate to the info screen
    end
    MFACTX->>RHPRHP: Navigate to the revoke screen
    User->>RHPRHP: Take action (i.e. click "Revoke access" button and confirm it afterwards)
    RHPRHP->>MFACTX: Run the revoke method
    MFACTX->>Module: Pass the info that the revoke was called
        Note over MFACTX,Module: The module is a hook used to run the biometrics flow
    Module->>Module: Revoke locally stored keys
        Module->>Server: Call API to revoke stored public key
    Module->>MFACTX: Pass the info that the access was revoked
    MFACTX->>RHPRHP: Navigate to the Success screen
```

```bash
src/
├── components/
│   └── MultifactorAuthenticationContext/
│       ├── scenarios.ts
│       ├── index.tsx
│       └── ... (helpers, types etc.)
├── hooks/
│   └── MultifactorAuthentication/
│       ├── useFallback.ts
│       ├── useNativeBiometrics/
│       │   ├── index.ts
│       │   └── useSetup.ts (internal hook)
│       ├── usePasskeysBiometrics.ts
│       └── ... (helpers, types etc.)
└── libs/
    └── MultifactorAuthentication/
        ├── Passkeys/
        │   └── ... 
        └── Biometrics/
            ├── SecureStore.ts
            ├── SecureStore.desktop.ts
            └── ...
```
