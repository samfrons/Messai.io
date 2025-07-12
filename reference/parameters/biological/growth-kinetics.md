# Growth Kinetics

## Definition

Growth kinetics in bioelectrochemical systems describes the mathematical relationships governing microbial growth, substrate consumption, and product formation. These kinetic parameters are essential for understanding system performance, predicting behavior under different conditions, and optimizing operational parameters for maximum efficiency.

## Typical Values

### Growth Rate (μ)
- **Range**: 0.01-5 day⁻¹
- **Typical**: 0.1-1 day⁻¹
- **Outlier threshold**: >2 day⁻¹

### Doubling Time
- **Range**: 0.5-168 hours
- **Typical**: 2-24 hours
- **Outlier threshold**: >72 hours
- **Validation**: Faster doubling needs verification

### Substrate Affinity (Ks)
- **Range**: 1-1000 mg/L
- **Typical**: 50-500 mg/L
- **Outlier threshold**: >750 mg/L

### Yield Coefficient
- **Range**: 0.01-0.5 g VSS/g COD
- **Typical**: 0.1-0.3 g VSS/g COD
- **Outlier threshold**: >0.4 g VSS/g COD

### Decay Rate
- **Range**: 0.001-0.5 day⁻¹
- **Typical**: 0.01-0.1 day⁻¹
- **Outlier threshold**: >0.3 day⁻¹

## Measurement Methods

### Direct Growth Measurement
- **Optical density (OD₆₀₀)**: Turbidity-based growth monitoring
- **Dry weight**: Gravimetric biomass determination
- **Volatile suspended solids (VSS)**: Organic biomass content
- **Protein content**: Bradford or Lowry assay for cellular protein

### Cell Count Methods
- **Plate counting**: Colony forming units (CFU)
- **Flow cytometry**: Automated cell counting and viability
- **Microscopy**: Direct cell enumeration
- **Most probable number (MPN)**: Statistical cell estimation

### Molecular Methods
- **qPCR**: Quantitative gene copy number
- **ATP measurement**: Bioluminescence assay for viable cells
- **rRNA analysis**: Ribosomal RNA as growth indicator
- **Fluorescent proteins**: Real-time growth monitoring

### Substrate Consumption
- **COD depletion**: Chemical oxygen demand reduction
- **HPLC analysis**: Specific substrate concentration
- **Respirometry**: Oxygen uptake rate
- **Gas chromatography**: Volatile metabolite analysis

## Affecting Factors

### Environmental Conditions
- **Temperature**: Arrhenius relationship affects growth rate
- **pH**: Optimal range 6.5-7.5 for most species
- **Dissolved oxygen**: Affects aerobic vs anaerobic growth
- **Redox potential**: Influences electron acceptor availability

### Substrate Factors
- **Substrate concentration**: Monod kinetics relationship
- **Substrate type**: Different substrates support different growth rates
- **Nutrient limitation**: N, P, or trace element limitations
- **Substrate inhibition**: High concentrations may inhibit growth

### System Design
- **Residence time**: Affects biomass retention and growth
- **Mixing**: Influences mass transfer and growth uniformity
- **Electrode potential**: May affect growth in BES systems
- **Biofilm formation**: Attached vs suspended growth kinetics

### Microbial Factors
- **Species composition**: Different species have different growth rates
- **Adaptation state**: Acclimated cultures grow faster
- **Growth phase**: Exponential vs stationary phase kinetics
- **Stress conditions**: Environmental stress reduces growth

## Performance Impact

### System Startup
- **Lag phase**: Initial adaptation period (1-7 days)
- **Exponential phase**: Rapid growth and current increase
- **Stationary phase**: Stable biomass and performance
- **Startup time**: Faster growth reduces startup time

### Electrical Performance
- **Power density**: Higher biomass generally increases power
- **Current density**: Correlates with active biomass
- **Coulombic efficiency**: Depends on growth yield and maintenance
- **Stability**: Balanced growth and decay maintains performance

### Treatment Efficiency
- **Substrate removal**: Growth rate affects removal kinetics
- **Biofilm development**: Growth rate influences biofilm formation
- **Process stability**: Consistent growth maintains treatment
- **Shock recovery**: Growth rate affects recovery from perturbations

## Species Considerations

### Geobacter sulfurreducens
- **Growth rate**: 0.1-0.5 day⁻¹ (acetate)
- **Doubling time**: 3-17 hours
- **Yield coefficient**: 0.1-0.2 g VSS/g COD
- **Substrate affinity**: 20-100 mg/L acetate

### Shewanella oneidensis
- **Growth rate**: 0.2-1.0 day⁻¹ (lactate)
- **Doubling time**: 2-8 hours
- **Yield coefficient**: 0.2-0.4 g VSS/g COD
- **Substrate affinity**: 50-200 mg/L lactate

### Pseudomonas aeruginosa
- **Growth rate**: 0.5-2.0 day⁻¹ (glucose)
- **Doubling time**: 1-3 hours
- **Yield coefficient**: 0.3-0.5 g VSS/g COD
- **Substrate affinity**: 10-100 mg/L glucose

### Mixed Communities
- **Growth rate**: 0.05-0.3 day⁻¹ (complex substrates)
- **Doubling time**: 5-35 hours
- **Yield coefficient**: 0.1-0.3 g VSS/g COD
- **Substrate affinity**: 100-1000 mg/L COD

## Validation Rules

### Growth Rate
- Must be positive (>0 day⁻¹)
- Values >2 day⁻¹ require verification
- Should correlate with substrate concentration

### Doubling Time
- Must be positive (>0 hours)
- Values <1 hour require verification
- Should be consistent with growth rate (td = ln(2)/μ)

### Substrate Affinity
- Must be positive (>0 mg/L)
- Values <10 mg/L indicate very high affinity
- Should be consistent with substrate type

### Yield Coefficient
- Must be positive (>0 g VSS/g COD)
- Values >0.5 g VSS/g COD require verification
- Should be consistent with microbial species

### Decay Rate
- Must be positive (>0 day⁻¹)
- Values >0.3 day⁻¹ indicate stressed conditions
- Should be lower than growth rate for net growth

### Quality Control
- Sterile controls must show no growth
- Positive controls should match expected values
- Duplicate cultures within 10% variation

## References

### Growth Kinetics Fundamentals
- Monod, J. (1949). The growth of bacterial cultures. Annual Review of Microbiology, 3(1), 371-394.
- Pirt, S.J. (1975). Principles of Microbe and Cell Cultivation. Blackwell Scientific Publications.

### Bioelectrochemical Growth Kinetics
- Logan, B.E., et al. (2006). Electricity generation from cysteine in a microbial fuel cell. Water Research, 40(14), 2799-2808.
- Nevin, K.P., et al. (2008). Anode biofilm transcriptomics reveals outer surface components essential for high density current production in Geobacter sulfurreducens fuel cells. PLoS One, 3(5), e2313.

### Kinetic Modeling
- Grady Jr, C.P.L., et al. (2011). Biological Wastewater Treatment, 3rd Edition. CRC Press.
- Rittmann, B.E., & McCarty, P.L. (2001). Environmental Biotechnology: Principles and Applications. McGraw-Hill.

### Species-Specific Kinetics
- Coppi, M.V., et al. (2001). Development of a genetic system for Geobacter sulfurreducens. Applied and Environmental Microbiology, 67(7), 3180-3187.
- Pinchuk, G.E., et al. (2010). Constraint-based model of Shewanella oneidensis MR-1 metabolism: a tool for data analysis and hypothesis generation. PLoS Computational Biology, 6(6), e1000822.

### Measurement Techniques
- Stevenson, B.S., et al. (2011). Spatially resolved uptake of carbon tetrachloride and its transformation to carbon dioxide by indoor air monolith biofilters. Environmental Science & Technology, 45(6), 2498-2505.
- Hao, O.J., et al. (1983). Model for single-sludge nitrogen removal systems. Journal of Environmental Engineering, 109(3), 532-556.

### Mathematical Modeling
- Picioreanu, C., et al. (2007). Mathematical model for microbial fuel cells with anodic biofilms and anaerobic digestion. Water Science & Technology, 55(8-9), 225-232.
- Marcus, A.K., et al. (2007). Conduction‐based modeling of the biofilm anode of a microbial fuel cell. Biotechnology and Bioengineering, 98(6), 1171-1182.