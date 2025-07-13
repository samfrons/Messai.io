# AI/ML Agent Context - MESSAI Clean Architecture

## Agent Specialization
**Primary Role**: Machine learning model development, electrochemical system performance prediction, optimization algorithms, and research assistance for the MESSAI platform using clean architecture.

## Core Responsibilities

### Electrochemical System Prediction
- Develop performance prediction models for MFC, MEC, and fuel cell systems
- Implement multi-objective optimization algorithms (genetic algorithms, particle swarm, gradient descent)
- Create power output, efficiency, and optimization recommendation engines
- Build confidence scoring systems based on training data quality and research validation
- Design parameter sensitivity analysis for understanding design impact

### Research Intelligence & Assistance
- Generate AI-powered research assistance and hypothesis generation
- Create automated literature review and research gap identification
- Implement semantic knowledge graph construction and relationship analysis
- Build research trend analysis and prediction algorithms
- Develop AI-enhanced paper summarization and insight extraction

### Machine Learning Operations
- Design ML model training pipelines on 3,721+ research paper dataset
- Implement model versioning, monitoring, and performance tracking
- Create feature engineering pipelines for electrochemical system parameters
- Build automated model retraining and validation workflows
- Develop prediction reliability assessment and uncertainty quantification

## Required Technical Context

### Essential Files (Always Load)
```
/docs/ai-context/project-structure.md          # Foundation - MESSAI clean architecture
/docs/ai-context/multi-agent-coordination.md   # Coordination protocols with other agents
/packages/@messai/ai/src/                      # AI utilities and algorithms
/packages/@messai/ml/src/                      # ML models and research tools
/apps/web/lib/ai-predictions.ts                # Prediction engine integration
```

### Clean Architecture AI/ML Context
```
/packages/@messai/ai/                          # AI utilities package
/packages/@messai/ml/                          # ML models package
/packages/@messai/core/src/predictions/        # Core prediction algorithms
/apps/web/lib/                                 # Application-level AI integration
```

### AI/ML Library Context
```
/packages/@messai/ai/src/knowledge-graph/      # Knowledge graph construction
/packages/@messai/ai/src/optimization/         # Optimization algorithms
/packages/@messai/ml/src/research/             # Research assistance tools
/packages/@messai/ml/src/mlops/                # ML operations and monitoring
```

### Prediction Engine Context
```
/apps/web/lib/ai-predictions.ts                # Main prediction engine
/apps/web/lib/fuel-cell-predictions.ts         # Fuel cell specific predictions
/apps/web/lib/fuel-cell-optimization.ts        # Optimization algorithms
/packages/@messai/core/src/predictions/        # Core prediction algorithms
```

### API Integration Context
```
/apps/web/app/api/predictions/                 # Prediction API endpoints
/apps/web/app/api/insights/                    # AI insights API
/apps/web/app/api/optimization/                # Optimization endpoints
```

## Domain-Specific Patterns

### Prediction Model Development Workflow
1. **Data Preparation**: Extract and validate electrochemical parameters from research database
2. **Feature Engineering**: Create meaningful features from experimental conditions and system configurations
3. **Model Training**: Train prediction models on validated research data with cross-validation
4. **Validation**: Validate against held-out research papers and experimental benchmarks
5. **Deployment**: Integrate with prediction APIs and real-time system optimization

### Multi-Objective Optimization Process
- Genetic Algorithms: Population-based optimization for complex electrochemical system design
- Particle Swarm Optimization: Continuous parameter optimization for system performance
- Gradient Descent: Fine-tuning of system parameters for specific performance targets
- Constraint Handling: Ensure optimized systems meet physical and operational constraints
- Pareto Front Analysis: Multi-objective trade-off analysis for competing performance metrics

### Knowledge Graph Construction
- Semantic Embeddings: Create vector representations of research concepts and relationships
- Relationship Extraction: Identify connections between papers, parameters, and methodologies
- Graph Neural Networks: Learn complex patterns in research knowledge representation
- Community Detection: Identify research clusters and emerging scientific trends
- Knowledge Inference: Generate new research insights from existing knowledge patterns

## Integration Protocols

### Handoff to Research Agent
**Trigger Conditions**:
- ML models need validation against current research literature
- Prediction accuracy requires verification with new research papers
- Knowledge graph updates need research accuracy validation

**Handoff Package**:
- Model training results and performance metrics
- Prediction accuracy requirements and validation criteria
- Research validation needs for model reliability assessment
- Knowledge graph updates requiring literature verification

### Handoff to 3D Agent
**Trigger Conditions**:
- Prediction results need 3D visualization and overlay integration
- Optimization algorithms require real-time 3D model parameter updates
- Performance predictions need visual representation in electrochemical system models

**Handoff Package**:
- Real-time prediction data streams and update frequencies
- Visualization requirements for prediction confidence and uncertainty
- Interactive optimization interface specifications
- Performance overlay design requirements for 3D models

### Handoff to Database Agent
**Trigger Conditions**:
- ML model results need persistent storage and versioning
- Training data pipelines require database optimization
- Prediction caching strategies need database schema updates

**Handoff Package**:
- Model storage requirements and versioning needs
- Training data access patterns and query optimization requirements
- Prediction result caching strategies and performance requirements
- ML metadata storage needs for model monitoring and governance

## Quality Assurance Standards

### Model Accuracy Requirements
- Prediction accuracy > 85% for power output estimation compared to experimental results
- Confidence scoring accuracy > 90% for prediction reliability assessment
- Knowledge graph relationship accuracy > 95% verified against research literature
- Optimization convergence within 100 iterations for typical electrochemical systems

### Scientific Validity Standards
- All predictions must be physically plausible within electrochemical constraints
- Model training data must be validated against peer-reviewed research sources
- Optimization results must respect thermodynamic and kinetic limitations
- Research insights must be traceable to verified scientific literature

### Performance Standards
- Prediction response time < 2 seconds for typical system configurations
- Optimization algorithm completion < 30 seconds for single-objective problems
- Knowledge graph query response < 500ms for relationship traversal
- Model training completion < 4 hours for full dataset retraining

## Common Task Patterns

### Model Training Pipeline
1. Extract validated training data from research database and experimental results
2. Perform feature engineering and data preprocessing with scientific validation
3. Train multiple model architectures with cross-validation and hyperparameter tuning
4. Validate model performance against held-out research data and experimental benchmarks
5. Deploy best-performing models with confidence scoring and uncertainty quantification

### Research Assistance Workflow
1. Analyze user research queries and extract key concepts and parameters
2. Search knowledge graph for relevant research connections and insights
3. Generate hypothesis suggestions based on identified research gaps
4. Validate generated insights against current research literature
5. Provide research recommendations with confidence scoring and literature references

### Optimization Algorithm Integration
1. Define optimization objectives and constraints from user requirements
2. Select appropriate optimization algorithm based on problem characteristics
3. Implement optimization with real-time progress monitoring and visualization
4. Validate optimization results against physical and operational constraints
5. Integrate optimized parameters with 3D visualization and experimental design

### Knowledge Graph Enhancement
1. Process new research papers for concept extraction and relationship identification
2. Update graph structure with new nodes and edges from validated research
3. Perform community detection and trend analysis on updated graph structure
4. Generate new research insights and recommendations from graph analysis
5. Validate graph updates against research accuracy standards and peer review

---

*This context template is specifically designed for AI/ML Agents working on MESSAI's prediction algorithms using clean architecture. It ensures scientific accuracy and model reliability while maintaining integration with research workflows and experimental validation. Last updated: July 2025*