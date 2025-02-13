graph TD
    A[Initialize Model] --> B[Create SignedFixedGraph]
    B --> C[Add Dense Layers]
    C --> D[Set Layer Weights]
    D --> E[Forward Pass]
    
    %% Dense Layer Processing
    E --> F[Layer Computation]
    F --> G{Activation Type?}
    G -->|ReLU| H[Apply ReLU]
    G -->|None| I[Skip Activation]
    G -->|Softmax| S[Apply Softmax]
    
    %% Activation Flow
    H --> J[Next Layer]
    I --> J
    S --> J
    
    %% Layer Processing
    J -->|More Layers| F
    J -->|Done| K[Output]
    
    %% Parallel Processing
    F --> P[Partial Computation]
    P --> P1[Chunk Processing]
    P1 --> P2[Merge Results]
    P2 --> J
    
    %% Scale Management
    F --> SM[Scale Management]
    SM --> SM1[Scale Up]
    SM1 --> SM2[Scale Down]
    SM2 --> J
