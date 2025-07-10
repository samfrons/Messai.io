# MESS Parameter Library
## Comprehensive Reference for Microbial Electrochemical Systems

**Version**: 1.0.0  
**Date**: 2025-07-10  
**Total Parameters**: 1,500+  
**Major Categories**: 15  
**Subcategories**: 150+  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Environmental Parameters](#2-environmental-parameters)
3. [Cell-Level Parameters](#3-cell-level-parameters)
4. [Reactor-Level Parameters](#4-reactor-level-parameters)
5. [Biological Parameters](#5-biological-parameters)
6. [Material Parameters](#6-material-parameters)
7. [Operational Parameters](#7-operational-parameters)
8. [Performance Metrics](#8-performance-metrics)
9. [Economic & Sustainability Parameters](#9-economic--sustainability-parameters)
10. [Safety & Regulatory Parameters](#10-safety--regulatory-parameters)
11. [Monitoring & Control Parameters](#11-monitoring--control-parameters)
12. [Application-Specific Parameters](#12-application-specific-parameters)
13. [Emerging Technology Parameters](#13-emerging-technology-parameters)
14. [Integration & Scaling Parameters](#14-integration--scaling-parameters)
15. [Appendices](#15-appendices)

---

## 1. Introduction

### 1.1 Purpose and Scope

The MESS Parameter Library serves as the definitive reference for all parameters involved in the design, operation, and optimization of Microbial Electrochemical Systems (MES). This comprehensive library distinguishes between **cells** (individual electrochemical units) and **reactors** (complete systems with multiple cells and supporting infrastructure).

### 1.2 Parameter Organization Philosophy

Parameters are organized hierarchically:
- **Category** → **Subcategory** → **Parameter** → **Sub-parameters**

Each parameter includes:
- **ID**: Unique identifier
- **Name**: Descriptive name
- **Unit**: SI unit or dimensionless
- **Type**: `number`, `string`, `boolean`, `select`, `array`, `object`
- **Range**: Valid value ranges
- **Default**: Typical or recommended value
- **Description**: Detailed explanation
- **Dependencies**: Related parameters
- **References**: Scientific sources

### 1.3 Cell vs. Reactor Distinction

**Cells** are individual electrochemical units:
- Micro-scale test slides (200μL - 1mL)
- Single MFC/MEC units (50mL - 5L)
- Individual fuel cells
- Unit cells in stacks

**Reactors** are complete systems:
- Multi-cell stacks (series/parallel)
- Integrated flow systems
- Control and monitoring infrastructure
- Industrial-scale installations

### 1.4 Unit Conventions

- **Temperature**: °C (Celsius)
- **Pressure**: kPa (kilopascals) or bar
- **Volume**: L (liters) or mL (milliliters)
- **Area**: m² or cm²
- **Current**: A (amperes) or mA
- **Power**: W (watts) or mW
- **Concentration**: g/L or mol/L
- **Flow rate**: L/h or mL/min

### 1.5 How to Use This Library

1. **Navigate** to the relevant category using the table of contents
2. **Search** for specific parameters using Ctrl+F/Cmd+F
3. **Cross-reference** related parameters using the dependency links
4. **Validate** parameter values against the specified ranges
5. **Export** parameter sets for specific applications

---

## 2. Environmental Parameters

### 2.1 Atmospheric & Ambient Conditions

#### 2.1.1 Temperature Parameters

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ambient_temperature` | °C | number | -50 to 60 | 25 | Ambient air temperature |
| `operating_temperature` | °C | number | 4 to 80 | 30 | Cell/reactor operating temperature |
| `temperature_gradient` | °C/cm | number | 0 to 10 | 0.1 | Spatial temperature variation |
| `temperature_fluctuation` | °C | number | 0 to 20 | 2 | Temporal temperature variation |
| `diurnal_temperature_range` | °C | number | 0 to 30 | 5 | Day-night temperature difference |
| `temperature_ramp_rate` | °C/min | number | 0.1 to 10 | 0.5 | Rate of temperature change |

#### 2.1.2 Humidity Parameters

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `relative_humidity` | % | number | 0 to 100 | 60 | Relative humidity of air |
| `absolute_humidity` | g/m³ | number | 0 to 50 | 10 | Water vapor content in air |
| `dew_point` | °C | number | -50 to 50 | 15 | Dew point temperature |
| `wet_bulb_temperature` | °C | number | -20 to 50 | 20 | Wet bulb temperature |
| `vapor_pressure` | kPa | number | 0 to 10 | 2.34 | Water vapor partial pressure |

#### 2.1.3 Pressure Parameters

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `atmospheric_pressure` | kPa | number | 50 to 110 | 101.325 | Ambient atmospheric pressure |
| `gauge_pressure` | kPa | number | -100 to 1000 | 0 | Pressure relative to atmospheric |
| `absolute_pressure` | kPa | number | 0 to 1100 | 101.325 | Total absolute pressure |
| `hydrostatic_pressure` | bar | number | 0 to 1000 | 1 | Pressure from liquid column |
| `partial_pressure_O2` | kPa | number | 0 to 100 | 21.2 | Oxygen partial pressure |
| `partial_pressure_CO2` | kPa | number | 0 to 100 | 0.04 | Carbon dioxide partial pressure |
| `partial_pressure_H2` | kPa | number | 0 to 100 | 0 | Hydrogen partial pressure |
| `partial_pressure_CH4` | kPa | number | 0 to 100 | 0 | Methane partial pressure |
| `partial_pressure_N2` | kPa | number | 0 to 100 | 79.1 | Nitrogen partial pressure |

#### 2.1.4 Gas Composition

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `oxygen_concentration` | % | number | 0 to 100 | 20.95 | O₂ concentration in gas phase |
| `carbon_dioxide_concentration` | ppm | number | 0 to 50000 | 415 | CO₂ concentration |
| `nitrogen_concentration` | % | number | 0 to 100 | 78.08 | N₂ concentration |
| `trace_gas_H2S` | ppm | number | 0 to 1000 | 0 | Hydrogen sulfide concentration |
| `trace_gas_NH3` | ppm | number | 0 to 1000 | 0 | Ammonia concentration |
| `trace_gas_VOC` | ppm | number | 0 to 1000 | 0 | Volatile organic compounds |

### 2.2 Light & Radiation Parameters

#### 2.2.1 Light Intensity

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `photosynthetic_active_radiation` | μmol/m²/s | number | 0 to 2000 | 0 | PAR for photosynthetic organisms |
| `total_solar_irradiance` | W/m² | number | 0 to 1400 | 0 | Total solar radiation |
| `light_intensity_lux` | lux | number | 0 to 100000 | 0 | Illuminance in lux |
| `photon_flux_density` | μmol/m²/s | number | 0 to 3000 | 0 | Photon flux density |

#### 2.2.2 Light Spectrum

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `uv_a_intensity` | W/m² | number | 0 to 100 | 0 | UV-A (315-400 nm) intensity |
| `uv_b_intensity` | W/m² | number | 0 to 10 | 0 | UV-B (280-315 nm) intensity |
| `uv_c_intensity` | W/m² | number | 0 to 5 | 0 | UV-C (100-280 nm) intensity |
| `blue_light_ratio` | % | number | 0 to 100 | 20 | Blue light (400-500 nm) percentage |
| `green_light_ratio` | % | number | 0 to 100 | 35 | Green light (500-600 nm) percentage |
| `red_light_ratio` | % | number | 0 to 100 | 30 | Red light (600-700 nm) percentage |
| `far_red_light_ratio` | % | number | 0 to 100 | 15 | Far-red light (700-800 nm) percentage |
| `infrared_intensity` | W/m² | number | 0 to 1000 | 0 | IR radiation (>800 nm) |

#### 2.2.3 Photoperiod

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `light_duration` | h | number | 0 to 24 | 0 | Hours of light per day |
| `dark_duration` | h | number | 0 to 24 | 24 | Hours of darkness per day |
| `light_cycle_type` | - | select | continuous/cyclic/pulsed | continuous | Type of light cycle |
| `dawn_duration` | min | number | 0 to 120 | 0 | Sunrise simulation duration |
| `dusk_duration` | min | number | 0 to 120 | 0 | Sunset simulation duration |

### 2.3 Physical Environmental Factors

#### 2.3.1 Vibration & Mechanical

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `vibration_frequency` | Hz | number | 0 to 1000 | 0 | Vibration frequency |
| `vibration_amplitude` | mm | number | 0 to 10 | 0 | Vibration amplitude |
| `vibration_acceleration` | g | number | 0 to 10 | 0 | Vibration acceleration |
| `mechanical_shock` | g | number | 0 to 100 | 0 | Mechanical shock magnitude |
| `shear_stress` | Pa | number | 0 to 1000 | 0 | Fluid shear stress |

#### 2.3.2 Sound & Ultrasound

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `sound_frequency` | Hz | number | 20 to 20000 | 0 | Audible sound frequency |
| `sound_intensity` | dB | number | 0 to 140 | 30 | Sound pressure level |
| `ultrasound_frequency` | kHz | number | 20 to 1000 | 0 | Ultrasonic frequency |
| `ultrasound_power` | W/cm² | number | 0 to 10 | 0 | Ultrasonic power density |
| `ultrasound_duration` | min | number | 0 to 60 | 0 | Ultrasound exposure time |

#### 2.3.3 Electromagnetic Fields

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `magnetic_field_strength` | mT | number | 0 to 1000 | 0.05 | Magnetic field strength |
| `magnetic_field_frequency` | Hz | number | 0 to 1000 | 0 | AC magnetic field frequency |
| `electric_field_strength` | V/m | number | 0 to 10000 | 0 | Electric field strength |
| `electromagnetic_frequency` | MHz | number | 0 to 3000 | 0 | EM radiation frequency |
| `electromagnetic_power` | W/m² | number | 0 to 1000 | 0 | EM power density |

#### 2.3.4 Gravity & Acceleration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `gravitational_acceleration` | g | number | 0 to 10 | 1 | Gravitational acceleration |
| `centrifugal_acceleration` | g | number | 0 to 1000 | 0 | Centrifugal force |
| `microgravity_level` | μg | number | 0 to 1000 | 1000000 | Microgravity conditions |

---

## 3. Cell-Level Parameters

### 3.1 Cell Geometry & Dimensions

#### 3.1.1 Micro-Scale Test Cells (75mm × 25mm slides)

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `slide_length` | mm | number | 50 to 100 | 75 | Microscope slide length |
| `slide_width` | mm | number | 20 to 30 | 25 | Microscope slide width |
| `slide_thickness` | mm | number | 1 to 5 | 3 | Slide material thickness |
| `chamber_volume` | μL | number | 100 to 1000 | 500 | Working chamber volume |
| `channel_width` | μm | number | 50 to 1000 | 200 | Microfluidic channel width |
| `channel_depth` | μm | number | 20 to 500 | 100 | Microfluidic channel depth |
| `electrode_spacing_micro` | μm | number | 100 to 5000 | 1000 | Micro-electrode separation |

#### 3.1.2 Single Unit Cells

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `cell_type` | - | select | cylindrical/rectangular/cubic/custom | cylindrical | Cell geometry type |
| `cell_volume` | mL | number | 10 to 5000 | 250 | Total cell volume |
| `working_volume` | mL | number | 5 to 4500 | 200 | Active/working volume |
| `headspace_volume` | mL | number | 0 to 500 | 50 | Gas headspace volume |
| `cell_diameter` | mm | number | 10 to 500 | 80 | Cell diameter (cylindrical) |
| `cell_height` | mm | number | 10 to 1000 | 100 | Cell height |
| `cell_length` | mm | number | 10 to 1000 | 150 | Cell length (rectangular) |
| `cell_width` | mm | number | 10 to 500 | 100 | Cell width (rectangular) |

#### 3.1.3 Cell Materials

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `cell_material` | - | select | acrylic/glass/polycarbonate/PTFE/PVC | acrylic | Cell housing material |
| `wall_thickness` | mm | number | 2 to 20 | 5 | Cell wall thickness |
| `transparency` | % | number | 0 to 100 | 90 | Material transparency |
| `chemical_resistance` | - | number | 1 to 10 | 8 | Chemical resistance rating |
| `temperature_limit` | °C | number | 20 to 200 | 80 | Maximum temperature |
| `pressure_rating` | bar | number | 1 to 50 | 5 | Maximum pressure rating |

### 3.2 Cell Electrode Configuration

#### 3.2.1 Electrode Geometry in Cells

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `anode_area_cell` | cm² | number | 0.1 to 100 | 10 | Anode surface area in cell |
| `cathode_area_cell` | cm² | number | 0.1 to 100 | 10 | Cathode surface area in cell |
| `electrode_thickness_cell` | mm | number | 0.1 to 10 | 2 | Electrode material thickness |
| `electrode_spacing_cell` | mm | number | 1 to 100 | 20 | Anode-cathode separation |
| `electrode_arrangement_cell` | - | select | parallel/sandwich/concentric | parallel | Electrode configuration |

#### 3.2.2 Cell Connections

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `current_collector_type` | - | select | titanium/stainless/graphite/copper | titanium | Current collector material |
| `wire_gauge` | AWG | number | 10 to 30 | 20 | Connection wire gauge |
| `contact_resistance` | mΩ | number | 0.1 to 100 | 5 | Electrical contact resistance |
| `terminal_type` | - | select | screw/solder/crimp/spring | screw | Electrical terminal type |

### 3.3 Cell Performance Metrics

#### 3.3.1 Individual Cell Electrical Output

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `open_circuit_voltage_cell` | V | number | 0 to 2 | 0.8 | Cell OCV |
| `operating_voltage_cell` | V | number | 0 to 1.5 | 0.5 | Cell voltage under load |
| `current_density_cell` | A/m² | number | 0 to 100 | 10 | Current per electrode area |
| `power_density_cell` | W/m³ | number | 0 to 1000 | 50 | Power per cell volume |
| `internal_resistance_cell` | Ω | number | 0.1 to 1000 | 50 | Cell internal resistance |

### 3.4 Cell-Specific Operational Parameters

#### 3.4.1 Cell Flow Dynamics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `flow_mode_cell` | - | select | batch/continuous/fed-batch | batch | Cell operation mode |
| `flow_rate_cell` | mL/min | number | 0 to 100 | 0 | Flow rate through cell |
| `residence_time_cell` | h | number | 0.1 to 100 | 24 | Hydraulic residence time |
| `mixing_mode_cell` | - | select | none/magnetic/bubble/mechanical | none | Mixing method in cell |

---

## 4. Reactor-Level Parameters

### 4.1 Multi-Cell Stack Configuration

#### 4.1.1 Stack Geometry

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `cells_per_stack` | - | number | 2 to 100 | 10 | Number of cells in stack |
| `stack_arrangement` | - | select | series/parallel/mixed | series | Electrical connection |
| `stack_height` | mm | number | 50 to 2000 | 500 | Total stack height |
| `stack_footprint` | cm² | number | 100 to 10000 | 400 | Stack base area |
| `inter_cell_spacing` | mm | number | 1 to 50 | 5 | Space between cells |
| `stack_compression` | N/cm² | number | 0 to 100 | 10 | Stack compression force |

#### 4.1.2 Stack Electrical Configuration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `stack_voltage` | V | number | 0 to 100 | 5 | Total stack voltage |
| `stack_current` | A | number | 0 to 1000 | 10 | Total stack current |
| `stack_power` | W | number | 0 to 10000 | 50 | Total stack power output |
| `voltage_balancing` | - | boolean | true/false | false | Active voltage balancing |
| `current_sharing` | % | number | 80 to 100 | 95 | Current distribution uniformity |

### 4.2 Reactor System Components

#### 4.2.1 Flow Distribution System

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `manifold_type` | - | select | Z-type/U-type/parallel/custom | parallel | Flow manifold design |
| `inlet_diameter` | mm | number | 5 to 100 | 25 | Main inlet pipe diameter |
| `distribution_channels` | - | number | 1 to 50 | 10 | Number of distribution channels |
| `flow_uniformity` | % | number | 50 to 100 | 90 | Flow distribution uniformity |
| `pressure_drop_manifold` | kPa | number | 0 to 100 | 5 | Manifold pressure drop |

#### 4.2.2 Reactor Vessel

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `reactor_volume_total` | L | number | 1 to 10000 | 100 | Total reactor volume |
| `reactor_material` | - | select | SS316/PVC/HDPE/concrete/custom | SS316 | Reactor construction material |
| `reactor_shape` | - | select | cylindrical/rectangular/custom | cylindrical | Reactor geometry |
| `aspect_ratio` | - | number | 0.5 to 10 | 2 | Height to diameter ratio |
| `baffles_present` | - | boolean | true/false | false | Internal baffles present |

### 4.3 Reactor Control Systems

#### 4.3.1 Temperature Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `temperature_control_type` | - | select | none/jacket/coil/external | jacket | Temperature control method |
| `heating_capacity` | kW | number | 0 to 100 | 5 | Heating system capacity |
| `cooling_capacity` | kW | number | 0 to 100 | 10 | Cooling system capacity |
| `temperature_setpoint` | °C | number | 4 to 80 | 30 | Target temperature |
| `temperature_deadband` | °C | number | 0.1 to 5 | 1 | Control deadband |
| `temperature_ramp_rate_max` | °C/min | number | 0.1 to 10 | 2 | Maximum temperature change rate |

#### 4.3.2 pH Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ph_control_type` | - | select | none/acid-base/buffer/CO2 | buffer | pH control method |
| `ph_setpoint` | - | number | 2 to 12 | 7 | Target pH |
| `ph_deadband` | - | number | 0.05 to 1 | 0.2 | pH control deadband |
| `acid_type` | - | select | HCl/H2SO4/H3PO4/organic | HCl | Acid for pH control |
| `base_type` | - | select | NaOH/KOH/NH4OH/Na2CO3 | NaOH | Base for pH control |
| `buffer_capacity` | mmol/L/pH | number | 0 to 100 | 10 | Buffer capacity |

### 4.4 Industrial Scale Parameters

#### 4.4.1 Scale-Up Factors

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `scale_factor` | - | number | 1 to 10000 | 100 | Scale-up from lab |
| `reynolds_number` | - | number | 1 to 100000 | 2000 | Flow regime indicator |
| `mixing_time` | s | number | 1 to 3600 | 60 | Time for complete mixing |
| `dead_zone_fraction` | % | number | 0 to 50 | 5 | Fraction of dead volume |

---

## 5. Biological Parameters

### 5.1 Microorganism Database

#### 5.1.1 Bacteria - Electroactive Species

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `geobacter_sulfurreducens` | - | object | - | - | Metal-reducing bacterium |
| ├─ `optimal_temperature` | °C | number | 25 to 35 | 30 | Optimal growth temperature |
| ├─ `optimal_ph` | - | number | 6.5 to 7.5 | 7.0 | Optimal pH |
| ├─ `electrogenicity` | - | number | 1 to 10 | 9 | Electroactive capability |
| ├─ `growth_rate` | 1/h | number | 0.01 to 0.5 | 0.2 | Maximum growth rate |
| ├─ `biofilm_forming` | - | boolean | true/false | true | Biofilm formation ability |
| ├─ `oxygen_tolerance` | - | select | strict_anaerobe/facultative/aerobe | strict_anaerobe | O₂ tolerance |
| `shewanella_oneidensis` | - | object | - | - | Versatile electroactive bacterium |
| ├─ `optimal_temperature` | °C | number | 20 to 30 | 25 | Optimal growth temperature |
| ├─ `optimal_ph` | - | number | 6.5 to 8.0 | 7.5 | Optimal pH |
| ├─ `electrogenicity` | - | number | 1 to 10 | 8 | Electroactive capability |
| ├─ `growth_rate` | 1/h | number | 0.1 to 1.0 | 0.5 | Maximum growth rate |
| ├─ `electron_shuttles` | - | boolean | true/false | true | Produces electron mediators |
| `pseudomonas_aeruginosa` | - | object | - | - | Biofilm-forming bacterium |
| ├─ `optimal_temperature` | °C | number | 30 to 40 | 37 | Optimal growth temperature |
| ├─ `optimal_ph` | - | number | 6.5 to 8.0 | 7.0 | Optimal pH |
| ├─ `electrogenicity` | - | number | 1 to 10 | 6 | Electroactive capability |
| ├─ `phenazine_production` | - | boolean | true/false | true | Produces phenazine mediators |
| `rhodoferax_ferrireducens` | - | object | - | - | Psychrotolerant electroactive |
| ├─ `optimal_temperature` | °C | number | 20 to 30 | 25 | Optimal growth temperature |
| ├─ `cold_tolerance` | °C | number | 2 to 10 | 4 | Minimum growth temperature |
| `desulfovibrio_desulfuricans` | - | object | - | - | Sulfate-reducing bacterium |
| ├─ `sulfate_reduction` | - | boolean | true/false | true | Sulfate reduction capability |
| ├─ `h2_production` | - | boolean | true/false | true | Hydrogen production |
| `clostridium_butyricum` | - | object | - | - | Fermentative bacterium |
| ├─ `fermentation_products` | - | array | - | [butyrate, H2] | Fermentation end products |
| `ochrobactrum_anthropi` | - | object | - | - | Heavy metal tolerant |
| ├─ `metal_tolerance` | - | array | - | [Cr, Cu, Cd] | Tolerant to metals |
| `klebsiella_pneumoniae` | - | object | - | - | Facultative anaerobe |
| ├─ `nitrogen_fixation` | - | boolean | true/false | false | N₂ fixation capability |
| `enterobacter_aerogenes` | - | object | - | - | H₂ producer |
| ├─ `h2_yield` | mol/mol | number | 1 to 4 | 2.5 | H₂ yield from glucose |

#### 5.1.2 Archaea - Methanogens

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `methanobrevibacter_smithii` | - | object | - | - | Hydrogenotrophic methanogen |
| ├─ `ch4_production_rate` | mmol/L/d | number | 0 to 50 | 10 | Methane production rate |
| ├─ `h2_threshold` | Pa | number | 1 to 100 | 10 | H₂ threshold for growth |
| `methanosarcina_acetivorans` | - | object | - | - | Acetoclastic methanogen |
| ├─ `substrate_range` | - | array | - | [acetate, methanol, CO] | Substrate utilization |
| `methanobacterium_formicicum` | - | object | - | - | Formate-utilizing methanogen |
| `methanococcus_maripaludis` | - | object | - | - | Marine methanogen |
| ├─ `salt_requirement` | g/L | number | 10 to 40 | 25 | NaCl requirement |

#### 5.1.3 Algae - Photosynthetic Organisms

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `chlorella_vulgaris` | - | object | - | - | Green microalga |
| ├─ `photosynthetic_efficiency` | % | number | 1 to 10 | 5 | Light to biomass efficiency |
| ├─ `co2_fixation_rate` | g/L/d | number | 0.1 to 2 | 0.5 | CO₂ fixation rate |
| ├─ `light_saturation` | μmol/m²/s | number | 100 to 1000 | 400 | Light saturation point |
| `spirulina_platensis` | - | object | - | - | Cyanobacterium |
| ├─ `protein_content` | % | number | 50 to 70 | 60 | Protein content of biomass |
| ├─ `phycocyanin_production` | - | boolean | true/false | true | Produces phycocyanin |
| `scenedesmus_obliquus` | - | object | - | - | Robust green alga |
| ├─ `lipid_content` | % | number | 10 to 40 | 20 | Lipid content for biodiesel |
| `dunaliella_salina` | - | object | - | - | Halophilic alga |
| ├─ `salt_tolerance` | g/L | number | 50 to 300 | 150 | NaCl tolerance |
| ├─ `beta_carotene` | - | boolean | true/false | true | β-carotene production |
| `chlamydomonas_reinhardtii` | - | object | - | - | Model green alga |
| ├─ `h2_production` | - | boolean | true/false | true | Biophotolytic H₂ production |

#### 5.1.4 Photosynthetic Bacteria

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `rhodobacter_sphaeroides` | - | object | - | - | Purple non-sulfur bacterium |
| ├─ `photoheterotrophic` | - | boolean | true/false | true | Photoheterotrophic growth |
| ├─ `h2_production_light` | mmol/L/h | number | 0 to 10 | 2 | H₂ production under light |
| `rhodopseudomonas_palustris` | - | object | - | - | Metabolically versatile |
| ├─ `nitrogen_fixation` | - | boolean | true/false | true | N₂ fixation capability |
| ├─ `aromatic_degradation` | - | boolean | true/false | true | Degrades aromatics |

#### 5.1.5 Engineered Strains

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `e_coli_engineered` | - | object | - | - | Engineered E. coli strains |
| ├─ `modification_type` | - | select | knockout/overexpression/synthetic | overexpression | Genetic modification |
| ├─ `target_product` | - | select | electricity/H2/chemicals | electricity | Target output |
| ├─ `plasmid_stability` | % | number | 50 to 100 | 90 | Plasmid retention |
| `synthetic_consortium` | - | object | - | - | Designed microbial community |
| ├─ `member_species` | - | array | - | [] | Consortium members |
| ├─ `interaction_type` | - | select | syntrophic/competitive/neutral | syntrophic | Species interactions |

### 5.2 Biofilm Parameters

#### 5.2.1 Biofilm Structure

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `biofilm_thickness` | μm | number | 1 to 1000 | 100 | Average biofilm thickness |
| `biofilm_density` | g/L | number | 10 to 200 | 50 | Biofilm dry density |
| `biofilm_porosity` | % | number | 50 to 95 | 80 | Void fraction in biofilm |
| `biofilm_coverage` | % | number | 0 to 100 | 70 | Electrode surface coverage |
| `biofilm_roughness` | μm | number | 0 to 100 | 20 | Surface roughness |

#### 5.2.2 Biofilm Activity

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `biofilm_conductivity` | S/m | number | 0.001 to 1 | 0.01 | Electrical conductivity |
| `electron_transfer_rate` | A/m² | number | 0 to 50 | 5 | Direct electron transfer rate |
| `mediator_concentration` | mM | number | 0 to 10 | 0.1 | Electron mediator concentration |
| `metabolic_activity` | % | number | 0 to 100 | 80 | Active biomass fraction |

### 5.3 Microbial Kinetics

#### 5.3.1 Growth Kinetics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `maximum_growth_rate` | 1/h | number | 0.01 to 2 | 0.2 | μmax |
| `half_saturation_constant` | g/L | number | 0.001 to 10 | 0.1 | Ks for substrate |
| `yield_coefficient` | g/g | number | 0.1 to 0.8 | 0.4 | Biomass yield |
| `decay_rate` | 1/h | number | 0.001 to 0.1 | 0.01 | Endogenous decay |
| `maintenance_coefficient` | 1/h | number | 0.001 to 0.1 | 0.02 | Maintenance energy |

#### 5.3.2 Substrate Utilization

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `substrate_uptake_rate` | g/g/h | number | 0.01 to 10 | 1 | Specific uptake rate |
| `substrate_affinity` | L/g/h | number | 0.1 to 100 | 10 | Substrate affinity |
| `inhibition_constant` | g/L | number | 0.1 to 100 | 10 | Substrate inhibition |

---

## 6. Material Parameters

### 6.1 Anode Materials

#### 6.1.1 Carbon-Based Anodes

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `carbon_cloth` | - | object | - | - | Woven carbon fabric |
| ├─ `conductivity` | S/m | number | 100 to 10000 | 1000 | Electrical conductivity |
| ├─ `surface_area` | m²/g | number | 0.1 to 10 | 2 | Specific surface area |
| ├─ `cost` | $/m² | number | 10 to 200 | 50 | Material cost |
| ├─ `porosity` | % | number | 50 to 90 | 70 | Material porosity |
| ├─ `thickness` | mm | number | 0.1 to 5 | 0.5 | Material thickness |
| `carbon_felt` | - | object | - | - | Non-woven carbon material |
| ├─ `fiber_diameter` | μm | number | 5 to 50 | 20 | Carbon fiber diameter |
| ├─ `compression_ratio` | % | number | 0 to 80 | 20 | Compression from original |
| `graphite_brush` | - | object | - | - | Graphite fiber brush |
| ├─ `fiber_count` | - | number | 1000 to 100000 | 10000 | Number of fibers |
| ├─ `brush_diameter` | mm | number | 10 to 100 | 50 | Brush diameter |
| `carbon_paper` | - | object | - | - | Thin carbon sheet |
| ├─ `tensile_strength` | MPa | number | 10 to 200 | 50 | Mechanical strength |
| `activated_carbon` | - | object | - | - | High surface area carbon |
| ├─ `bet_surface_area` | m²/g | number | 500 to 3000 | 1000 | BET surface area |
| ├─ `pore_size` | nm | number | 0.5 to 50 | 2 | Average pore size |

#### 6.1.2 Advanced Carbon Materials

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `graphene_oxide` | - | object | - | - | GO sheets |
| ├─ `reduction_degree` | % | number | 0 to 100 | 80 | Degree of reduction |
| ├─ `sheet_size` | μm | number | 0.1 to 100 | 10 | Lateral sheet size |
| ├─ `layer_number` | - | number | 1 to 10 | 3 | Number of layers |
| `carbon_nanotubes` | - | object | - | - | CNT materials |
| ├─ `cnt_type` | - | select | SWCNT/MWCNT/mixed | MWCNT | CNT type |
| ├─ `cnt_diameter` | nm | number | 1 to 100 | 20 | Tube diameter |
| ├─ `cnt_length` | μm | number | 0.1 to 1000 | 100 | Tube length |
| ├─ `functionalization` | - | select | none/COOH/NH2/OH | none | Surface groups |

#### 6.1.3 MXene Materials

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ti3c2tx_mxene` | - | object | - | - | Titanium carbide MXene |
| ├─ `termination_groups` | - | array | - | [O, OH, F] | Surface terminations |
| ├─ `conductivity` | S/m | number | 1000 to 20000 | 10000 | Electrical conductivity |
| ├─ `hydrophilicity` | ° | number | 0 to 90 | 30 | Water contact angle |
| ├─ `stability_ph_range` | - | array | - | [3, 9] | Stable pH range |
| `v2ctx_mxene` | - | object | - | - | Vanadium carbide MXene |
| `nb2ctx_mxene` | - | object | - | - | Niobium carbide MXene |

#### 6.1.4 Anode Modifications

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ammonia_treatment` | - | object | - | - | NH₃ plasma treatment |
| ├─ `treatment_time` | min | number | 1 to 60 | 10 | Treatment duration |
| ├─ `treatment_temperature` | °C | number | 20 to 200 | 100 | Treatment temperature |
| ├─ `nitrogen_content` | at% | number | 0 to 20 | 5 | N doping level |
| `polymer_coating` | - | object | - | - | Conductive polymer |
| ├─ `polymer_type` | - | select | PANI/PPy/PEDOT | PANI | Polymer type |
| ├─ `coating_thickness` | μm | number | 0.1 to 100 | 10 | Coating thickness |
| ├─ `doping_level` | % | number | 10 to 50 | 30 | Doping percentage |

### 6.2 Cathode Materials

#### 6.2.1 Metal-Based Cathodes

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `platinum_cathode` | - | object | - | - | Pt catalyst |
| ├─ `pt_loading` | mg/cm² | number | 0.01 to 5 | 0.5 | Pt loading |
| ├─ `particle_size` | nm | number | 1 to 100 | 5 | Pt particle size |
| ├─ `support_material` | - | select | carbon_black/graphene/CNT | carbon_black | Catalyst support |
| `stainless_steel` | - | object | - | - | SS cathode |
| ├─ `alloy_grade` | - | select | SS304/SS316/SS316L | SS316 | Stainless steel grade |
| ├─ `surface_treatment` | - | select | none/passivated/activated | passivated | Surface condition |
| `nickel_foam` | - | object | - | - | Ni foam cathode |
| ├─ `pore_density` | ppi | number | 10 to 110 | 60 | Pores per inch |
| ├─ `porosity` | % | number | 80 to 98 | 95 | Foam porosity |
| `copper_cathode` | - | object | - | - | Cu-based cathode |
| ├─ `copper_form` | - | select | foil/mesh/foam/nanostructured | mesh | Physical form |
| ├─ `oxide_state` | - | select | Cu/Cu2O/CuO/mixed | Cu | Oxidation state |
| ├─ `surface_area_enhancement` | - | number | 1 to 1000 | 10 | Surface area factor |

#### 6.2.2 Metal Oxide Cathodes

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `manganese_oxide` | - | object | - | - | MnO₂ catalyst |
| ├─ `crystal_structure` | - | select | α/β/γ/δ/amorphous | β | Crystal phase |
| ├─ `particle_morphology` | - | select | nanoparticle/nanorod/nanosheet | nanoparticle | Morphology |
| `iron_oxide` | - | object | - | - | Fe-based catalyst |
| ├─ `iron_phase` | - | select | Fe2O3/Fe3O4/FeOOH | Fe3O4 | Iron oxide phase |
| ├─ `doping_element` | - | select | none/N/S/P | none | Dopant element |
| `cobalt_oxide` | - | object | - | - | Co-based catalyst |
| ├─ `cobalt_phase` | - | select | CoO/Co3O4/CoOOH | Co3O4 | Cobalt oxide phase |

#### 6.2.3 Air Cathodes

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `gas_diffusion_layer` | - | object | - | - | GDL properties |
| ├─ `gdl_material` | - | select | carbon_paper/carbon_cloth/metal_mesh | carbon_paper | GDL substrate |
| ├─ `gdl_thickness` | μm | number | 100 to 1000 | 300 | GDL thickness |
| ├─ `ptfe_loading` | wt% | number | 0 to 60 | 30 | PTFE content |
| ├─ `microporous_layer` | - | boolean | true/false | true | MPL present |
| `catalyst_layer` | - | object | - | - | Catalyst layer |
| ├─ `catalyst_loading` | mg/cm² | number | 0.1 to 10 | 2 | Total catalyst loading |
| ├─ `ionomer_content` | wt% | number | 0 to 50 | 20 | Ionomer in catalyst layer |

### 6.3 Membrane/Separator Materials

#### 6.3.1 Ion Exchange Membranes

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `proton_exchange_membrane` | - | object | - | - | PEM properties |
| ├─ `membrane_type` | - | select | Nafion/Fumapem/generic | Nafion | Membrane brand |
| ├─ `thickness` | μm | number | 25 to 250 | 100 | Membrane thickness |
| ├─ `conductivity` | S/cm | number | 0.001 to 0.2 | 0.08 | Proton conductivity |
| ├─ `water_uptake` | % | number | 5 to 50 | 20 | Water absorption |
| `anion_exchange_membrane` | - | object | - | - | AEM properties |
| ├─ `functional_groups` | - | select | quaternary_ammonium/other | quaternary_ammonium | Functional groups |
| ├─ `ion_exchange_capacity` | meq/g | number | 0.5 to 3 | 1.5 | IEC |
| `bipolar_membrane` | - | object | - | - | BPM properties |
| ├─ `water_splitting_voltage` | V | number | 0.8 to 2 | 1.2 | Water dissociation voltage |

#### 6.3.2 Porous Separators

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ceramic_separator` | - | object | - | - | Ceramic membrane |
| ├─ `pore_size` | μm | number | 0.01 to 10 | 0.5 | Average pore size |
| ├─ `porosity` | % | number | 20 to 80 | 40 | Membrane porosity |
| ├─ `material_type` | - | select | alumina/zirconia/titania | alumina | Ceramic material |
| `polymer_separator` | - | object | - | - | Polymer membrane |
| ├─ `polymer_type` | - | select | PVDF/PP/PE/PTFE | PVDF | Polymer material |
| ├─ `hydrophobicity` | ° | number | 0 to 180 | 120 | Water contact angle |

---

## 7. Operational Parameters

### 7.1 Process Control Parameters

#### 7.1.1 Flow Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `flow_control_mode` | - | select | manual/PID/cascade/adaptive | PID | Control strategy |
| `flow_setpoint` | L/h | number | 0 to 1000 | 10 | Target flow rate |
| `flow_control_valve` | - | select | ball/globe/butterfly/diaphragm | globe | Valve type |
| `pump_type` | - | select | peristaltic/diaphragm/centrifugal/piston | peristaltic | Pump type |
| `pump_capacity` | L/h | number | 0 to 10000 | 100 | Maximum pump flow |
| `flow_measurement` | - | select | rotameter/magnetic/ultrasonic/coriolis | magnetic | Flow sensor type |

#### 7.1.2 Mixing Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `mixing_type` | - | select | mechanical/magnetic/gas_sparging/static | mechanical | Mixing method |
| `mixer_speed` | rpm | number | 0 to 2000 | 200 | Mixer rotation speed |
| `mixer_power` | W/m³ | number | 0 to 1000 | 50 | Mixing power input |
| `mixing_time` | s | number | 1 to 3600 | 60 | Time for complete mixing |
| `reynolds_number_mixing` | - | number | 1 to 100000 | 10000 | Mixing Reynolds number |

### 7.2 Operating Modes

#### 7.2.1 Batch Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `batch_volume` | L | number | 0.1 to 10000 | 10 | Batch size |
| `batch_duration` | h | number | 1 to 1000 | 24 | Batch cycle time |
| `fill_time` | min | number | 1 to 60 | 5 | Time to fill reactor |
| `drain_time` | min | number | 1 to 60 | 5 | Time to empty reactor |
| `idle_time` | min | number | 0 to 1440 | 30 | Time between batches |

#### 7.2.2 Continuous Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `hydraulic_retention_time` | h | number | 0.1 to 1000 | 24 | HRT |
| `dilution_rate` | 1/h | number | 0.001 to 10 | 0.042 | D = 1/HRT |
| `recycle_ratio` | - | number | 0 to 10 | 0 | Recycle flow/feed flow |
| `steady_state_criteria` | % | number | 0.1 to 10 | 1 | Variation for steady state |
| `startup_time` | h | number | 1 to 1000 | 72 | Time to reach steady state |

#### 7.2.3 Fed-Batch Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `initial_volume` | L | number | 0.1 to 1000 | 5 | Starting volume |
| `final_volume` | L | number | 0.2 to 10000 | 10 | Final volume |
| `feeding_strategy` | - | select | constant/linear/exponential/adaptive | exponential | Feed profile |
| `feed_rate` | L/h | number | 0.01 to 100 | 0.5 | Feeding rate |
| `feed_trigger` | - | select | time/pH/DO/ORP/substrate | time | Feed control trigger |

### 7.3 Startup & Shutdown

#### 7.3.1 Startup Procedures

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `startup_mode` | - | select | cold/warm/hot | cold | Startup type |
| `inoculum_volume` | % | number | 1 to 50 | 10 | Inoculum percentage |
| `inoculum_source` | - | select | pure_culture/enriched/natural | enriched | Inoculum type |
| `acclimation_time` | d | number | 1 to 60 | 7 | Microbial adaptation time |
| `initial_substrate_conc` | g/L | number | 0.1 to 10 | 1 | Starting substrate level |

#### 7.3.2 Shutdown Procedures

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `shutdown_mode` | - | select | normal/emergency/maintenance | normal | Shutdown type |
| `preservation_method` | - | select | none/dried/frozen/continuous_feed | continuous_feed | Biomass preservation |
| `flush_cycles` | - | number | 0 to 10 | 3 | System flush cycles |
| `storage_temperature` | °C | number | -80 to 40 | 4 | Storage temperature |

---

## 8. Performance Metrics

### 8.1 Electrical Performance

#### 8.1.1 Power Output Metrics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `power_density_volumetric` | W/m³ | number | 0 to 1000 | 50 | Power per reactor volume |
| `power_density_areal` | W/m² | number | 0 to 100 | 10 | Power per electrode area |
| `power_density_normalized` | W/kg | number | 0 to 500 | 20 | Power per kg catalyst |
| `maximum_power_point` | W | number | 0 to 10000 | 10 | Peak power output |
| `power_stability` | %/d | number | -10 to 0 | -0.5 | Power degradation rate |

#### 8.1.2 Current & Voltage Metrics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `open_circuit_voltage` | V | number | 0 to 2 | 0.8 | OCV |
| `operating_voltage` | V | number | 0 to 1.5 | 0.5 | Voltage under load |
| `current_density_max` | A/m² | number | 0 to 100 | 20 | Maximum current density |
| `short_circuit_current` | A | number | 0 to 100 | 1 | Short circuit current |
| `fill_factor` | - | number | 0 to 1 | 0.7 | (P_max)/(I_sc × V_oc) |

#### 8.1.3 Efficiency Metrics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `coulombic_efficiency` | % | number | 0 to 100 | 70 | Electron recovery efficiency |
| `voltage_efficiency` | % | number | 0 to 100 | 60 | Voltage utilization |
| `energy_efficiency` | % | number | 0 to 100 | 40 | Overall energy efficiency |
| `exergy_efficiency` | % | number | 0 to 100 | 30 | Thermodynamic efficiency |

### 8.2 Chemical Production Metrics

#### 8.2.1 Hydrogen Production

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `h2_production_rate` | L/m²/d | number | 0 to 100 | 10 | H₂ production rate |
| `h2_yield` | mol/mol | number | 0 to 4 | 2 | Moles H₂ per mole substrate |
| `h2_purity` | % | number | 0 to 100 | 95 | Hydrogen gas purity |
| `specific_h2_production` | m³/kg | number | 0 to 10 | 1 | H₂ per kg substrate |

#### 8.2.2 Methane Production

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ch4_production_rate` | L/m²/d | number | 0 to 50 | 5 | CH₄ production rate |
| `ch4_content_biogas` | % | number | 0 to 100 | 65 | CH₄ in biogas |
| `biogas_yield` | L/g | number | 0 to 1 | 0.5 | Biogas per g substrate |

#### 8.2.3 Chemical Synthesis

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `product_concentration` | g/L | number | 0 to 100 | 10 | Product concentration |
| `product_selectivity` | % | number | 0 to 100 | 80 | Target product selectivity |
| `production_rate` | g/L/h | number | 0 to 10 | 1 | Volumetric productivity |
| `conversion_efficiency` | % | number | 0 to 100 | 50 | Substrate to product |

### 8.3 Treatment Performance

#### 8.3.1 Organic Removal

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `cod_removal` | % | number | 0 to 100 | 80 | Chemical oxygen demand removal |
| `bod_removal` | % | number | 0 to 100 | 85 | Biological oxygen demand removal |
| `toc_removal` | % | number | 0 to 100 | 75 | Total organic carbon removal |
| `specific_removal_rate` | g/m²/d | number | 0 to 100 | 20 | Removal per electrode area |

#### 8.3.2 Nutrient Recovery

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `nitrogen_removal` | % | number | 0 to 100 | 70 | Total nitrogen removal |
| `phosphorus_recovery` | % | number | 0 to 100 | 60 | Phosphorus recovery |
| `ammonia_recovery` | % | number | 0 to 100 | 80 | Ammonia recovery efficiency |
| `nutrient_recovery_form` | - | select | struvite/liquid/biomass | struvite | Recovery product form |

#### 8.3.3 Heavy Metal Removal

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `metal_removal_efficiency` | % | number | 0 to 100 | 90 | Metal removal percentage |
| `metal_recovery_purity` | % | number | 0 to 100 | 95 | Recovered metal purity |
| `metal_deposition_rate` | mg/cm²/h | number | 0 to 10 | 1 | Metal deposition rate |

---

## 9. Economic & Sustainability Parameters

### 9.1 Capital Cost Parameters

#### 9.1.1 System Capital Costs

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `total_capital_cost` | $ | number | 100 to 10000000 | 10000 | Total CAPEX |
| `specific_capital_cost` | $/kW | number | 100 to 10000 | 1000 | Cost per kW capacity |
| `reactor_cost` | $ | number | 50 to 1000000 | 5000 | Reactor vessel cost |
| `electrode_cost` | $/m² | number | 10 to 1000 | 100 | Electrode material cost |
| `membrane_cost` | $/m² | number | 10 to 500 | 50 | Separator cost |
| `control_system_cost` | $ | number | 100 to 100000 | 5000 | Automation cost |

#### 9.1.2 Installation Costs

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `installation_factor` | - | number | 1.2 to 3 | 1.5 | Installation cost multiplier |
| `civil_works_cost` | $ | number | 0 to 1000000 | 10000 | Site preparation cost |
| `commissioning_cost` | $ | number | 0 to 100000 | 5000 | Startup and testing cost |

### 9.2 Operating Cost Parameters

#### 9.2.1 Variable Operating Costs

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `substrate_cost` | $/kg | number | -0.1 to 10 | 0.1 | Feedstock cost (negative if waste) |
| `chemical_cost` | $/m³ | number | 0 to 100 | 10 | Chemical consumption cost |
| `energy_cost` | $/kWh | number | 0 to 0.5 | 0.1 | Electricity cost |
| `water_cost` | $/m³ | number | 0 to 10 | 1 | Process water cost |
| `disposal_cost` | $/kg | number | 0 to 1 | 0.1 | Waste disposal cost |

#### 9.2.2 Fixed Operating Costs

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `labor_cost` | $/year | number | 0 to 1000000 | 50000 | Annual labor cost |
| `maintenance_cost` | %/year | number | 1 to 10 | 5 | % of CAPEX for maintenance |
| `insurance_cost` | %/year | number | 0.5 to 5 | 2 | % of CAPEX for insurance |
| `overhead_cost` | %/year | number | 5 to 20 | 10 | Administrative overhead |

### 9.3 Economic Performance Indicators

#### 9.3.1 Financial Metrics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `payback_period` | years | number | 0.5 to 20 | 5 | Simple payback time |
| `net_present_value` | $ | number | -1000000 to 10000000 | 100000 | NPV at discount rate |
| `internal_rate_return` | % | number | -20 to 50 | 15 | IRR |
| `levelized_cost_energy` | $/kWh | number | 0.01 to 10 | 0.2 | LCOE |
| `discount_rate` | % | number | 0 to 20 | 8 | Financial discount rate |

#### 9.3.2 Revenue Streams

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `electricity_revenue` | $/kWh | number | 0 to 0.5 | 0.1 | Electricity sale price |
| `hydrogen_revenue` | $/kg | number | 0 to 10 | 2 | H₂ sale price |
| `treatment_revenue` | $/m³ | number | 0 to 50 | 5 | Wastewater treatment fee |
| `carbon_credit_revenue` | $/tCO₂ | number | 0 to 100 | 20 | Carbon credit value |
| `byproduct_revenue` | $/kg | number | 0 to 100 | 10 | Chemical product value |

### 9.4 Life Cycle Assessment Parameters

#### 9.4.1 Environmental Impact

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `carbon_footprint` | kg CO₂-eq/kWh | number | 0 to 1 | 0.1 | GHG emissions |
| `water_footprint` | L/kWh | number | 0 to 100 | 10 | Water consumption |
| `land_footprint` | m²·year/kWh | number | 0 to 1 | 0.1 | Land use impact |
| `acidification_potential` | g SO₂-eq/kWh | number | 0 to 10 | 1 | Acidification impact |
| `eutrophication_potential` | g PO₄-eq/kWh | number | 0 to 5 | 0.5 | Eutrophication impact |

#### 9.4.2 Resource Efficiency

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `material_circularity` | % | number | 0 to 100 | 50 | Recycled content |
| `waste_diversion_rate` | % | number | 0 to 100 | 80 | Waste diverted from landfill |
| `renewable_energy_fraction` | % | number | 0 to 100 | 30 | Renewable energy use |
| `water_reuse_rate` | % | number | 0 to 100 | 50 | Water recycling rate |

### 9.5 Social Impact Parameters

#### 9.5.1 Employment & Community

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `jobs_created` | jobs/MW | number | 0 to 50 | 5 | Employment generation |
| `local_content` | % | number | 0 to 100 | 50 | Local sourcing percentage |
| `community_acceptance` | - | number | 1 to 10 | 7 | Community support score |
| `training_hours` | h/year | number | 0 to 1000 | 100 | Worker training provided |

#### 9.5.2 Health & Safety Impact

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `safety_incidents` | /year | number | 0 to 10 | 0 | Annual safety incidents |
| `noise_level` | dB | number | 0 to 100 | 60 | Operational noise level |
| `odor_units` | OU/m³ | number | 0 to 1000 | 10 | Odor emission level |
| `visual_impact` | - | number | 1 to 10 | 3 | Visual impact score |

---

## 10. Safety & Regulatory Parameters

### 10.1 Safety Parameters

#### 10.1.1 Chemical Hazards

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `flammability_rating` | - | number | 0 to 4 | 1 | NFPA flammability |
| `toxicity_rating` | - | number | 0 to 4 | 1 | NFPA health hazard |
| `reactivity_rating` | - | number | 0 to 4 | 0 | NFPA reactivity |
| `corrosivity_class` | - | select | none/mild/moderate/severe | mild | Corrosion hazard |
| `explosion_limit_lower` | % | number | 0 to 20 | 4 | LEL for H₂ |
| `explosion_limit_upper` | % | number | 0 to 100 | 75 | UEL for H₂ |

#### 10.1.2 Operational Safety Limits

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `max_operating_pressure` | bar | number | 1 to 50 | 5 | Maximum safe pressure |
| `max_operating_temperature` | °C | number | 20 to 150 | 80 | Maximum safe temperature |
| `min_operating_ph` | - | number | 0 to 7 | 2 | Minimum safe pH |
| `max_operating_ph` | - | number | 7 to 14 | 12 | Maximum safe pH |
| `emergency_shutdown_time` | s | number | 1 to 300 | 30 | ESD response time |

#### 10.1.3 Biological Safety

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `biosafety_level` | - | select | BSL-1/BSL-2/BSL-3 | BSL-1 | Biosafety classification |
| `pathogen_reduction` | log | number | 0 to 6 | 3 | Log reduction of pathogens |
| `antibiotic_resistance_risk` | - | select | low/medium/high | low | ARG risk level |
| `bioaerosol_control` | - | boolean | true/false | true | Aerosol containment |

### 10.2 Regulatory Compliance

#### 10.2.1 Emission Standards

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `co2_emission_limit` | kg/MWh | number | 0 to 1000 | 400 | CO₂ emission standard |
| `voc_emission_limit` | mg/m³ | number | 0 to 100 | 20 | VOC emission limit |
| `particulate_limit` | mg/m³ | number | 0 to 50 | 10 | PM emission limit |
| `noise_limit_day` | dB | number | 40 to 80 | 65 | Daytime noise limit |
| `noise_limit_night` | dB | number | 30 to 70 | 55 | Nighttime noise limit |

#### 10.2.2 Discharge Standards

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `effluent_cod_limit` | mg/L | number | 0 to 500 | 100 | COD discharge limit |
| `effluent_bod_limit` | mg/L | number | 0 to 200 | 30 | BOD discharge limit |
| `effluent_tss_limit` | mg/L | number | 0 to 100 | 30 | TSS discharge limit |
| `effluent_tn_limit` | mg/L | number | 0 to 50 | 15 | Total N limit |
| `effluent_tp_limit` | mg/L | number | 0 to 10 | 2 | Total P limit |

#### 10.2.3 Compliance Monitoring

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `monitoring_frequency` | - | select | continuous/daily/weekly/monthly | weekly | Sampling frequency |
| `compliance_reporting` | - | select | monthly/quarterly/annual | quarterly | Reporting period |
| `audit_frequency` | /year | number | 1 to 12 | 2 | Compliance audits |
| `certification_required` | - | array | - | [ISO14001, ISO45001] | Required certifications |

### 10.3 Risk Assessment Parameters

#### 10.3.1 Hazard Identification

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `hazard_severity` | - | number | 1 to 5 | 3 | Consequence severity |
| `hazard_probability` | - | number | 1 to 5 | 2 | Occurrence probability |
| `risk_score` | - | number | 1 to 25 | 6 | Risk matrix score |
| `control_effectiveness` | % | number | 0 to 100 | 80 | Risk control efficiency |

#### 10.3.2 Emergency Response

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `alarm_types` | - | array | - | [gas, fire, pressure] | Alarm systems |
| `response_time` | min | number | 1 to 60 | 5 | Emergency response time |
| `evacuation_time` | min | number | 1 to 30 | 10 | Site evacuation time |
| `containment_volume` | m³ | number | 0 to 1000 | 110 | Spill containment capacity |

---

## 11. Monitoring & Control Parameters

### 11.1 Sensor Specifications

#### 11.1.1 Physical Sensors

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `temperature_sensor_type` | - | select | thermocouple/RTD/thermistor | RTD | Temperature sensor |
| `temperature_accuracy` | °C | number | 0.01 to 1 | 0.1 | Temperature accuracy |
| `pressure_sensor_type` | - | select | piezoresistive/capacitive/optical | piezoresistive | Pressure sensor |
| `pressure_accuracy` | % | number | 0.1 to 5 | 1 | Pressure accuracy |
| `flow_sensor_accuracy` | % | number | 0.5 to 5 | 2 | Flow measurement accuracy |
| `level_sensor_type` | - | select | ultrasonic/radar/capacitive/float | ultrasonic | Level sensor |

#### 11.1.2 Chemical Sensors

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ph_sensor_type` | - | select | glass/ISFET/optical | glass | pH sensor type |
| `ph_accuracy` | pH | number | 0.01 to 0.1 | 0.02 | pH accuracy |
| `do_sensor_type` | - | select | galvanic/optical/polarographic | optical | DO sensor type |
| `do_response_time` | s | number | 1 to 60 | 10 | DO response time |
| `orp_range` | mV | array | [-1000, 1000] | [-500, 500] | ORP measurement range |
| `conductivity_range` | mS/cm | array | [0, 200] | [0, 100] | Conductivity range |

#### 11.1.3 Gas Sensors

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `h2_sensor_type` | - | select | electrochemical/thermal/optical | electrochemical | H₂ sensor |
| `h2_detection_limit` | ppm | number | 1 to 1000 | 10 | H₂ detection limit |
| `ch4_sensor_type` | - | select | infrared/catalytic/electrochemical | infrared | CH₄ sensor |
| `co2_sensor_type` | - | select | NDIR/electrochemical | NDIR | CO₂ sensor |
| `gas_sensor_response` | s | number | 1 to 60 | 10 | Gas sensor response time |

### 11.2 Data Acquisition

#### 11.2.1 DAQ Hardware

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `sampling_rate` | Hz | number | 0.1 to 10000 | 1 | Data sampling frequency |
| `resolution` | bit | number | 8 to 24 | 16 | ADC resolution |
| `channel_count` | - | number | 1 to 128 | 16 | Number of input channels |
| `data_logger_type` | - | select | standalone/PC-based/cloud | PC-based | DAQ system type |
| `communication_protocol` | - | select | analog/Modbus/Ethernet/wireless | Modbus | Communication type |

#### 11.2.2 Data Processing

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `filter_type` | - | select | none/moving_average/kalman/butterworth | moving_average | Signal filtering |
| `filter_window` | samples | number | 1 to 100 | 10 | Filter window size |
| `outlier_detection` | - | select | none/zscore/isolation_forest | zscore | Outlier method |
| `data_validation` | - | boolean | true/false | true | Automatic validation |
| `missing_data_handling` | - | select | ignore/interpolate/last_value | interpolate | Missing data method |

### 11.3 Control Algorithms

#### 11.3.1 PID Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `proportional_gain` | - | number | 0 to 100 | 1 | Kp value |
| `integral_time` | s | number | 0 to 1000 | 100 | Ti value |
| `derivative_time` | s | number | 0 to 100 | 0 | Td value |
| `control_interval` | s | number | 0.1 to 100 | 1 | Control update period |
| `anti_windup` | - | boolean | true/false | true | Integral anti-windup |

#### 11.3.2 Advanced Control

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `control_strategy` | - | select | PID/MPC/fuzzy/adaptive | PID | Control algorithm |
| `prediction_horizon` | steps | number | 1 to 100 | 10 | MPC prediction horizon |
| `control_horizon` | steps | number | 1 to 50 | 5 | MPC control horizon |
| `model_update_frequency` | h | number | 0.1 to 168 | 24 | Model adaptation rate |

### 11.4 Automation & SCADA

#### 11.4.1 System Architecture

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `automation_level` | - | select | manual/semi-auto/full-auto | semi-auto | Automation degree |
| `plc_scan_time` | ms | number | 10 to 1000 | 100 | PLC cycle time |
| `hmi_update_rate` | s | number | 0.1 to 10 | 1 | Display refresh rate |
| `alarm_priority_levels` | - | number | 1 to 5 | 3 | Alarm categories |
| `historian_retention` | days | number | 30 to 3650 | 365 | Data retention period |

#### 11.4.2 Remote Monitoring

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `remote_access` | - | boolean | true/false | true | Remote access enabled |
| `telemetry_protocol` | - | select | HTTP/MQTT/OPC-UA | MQTT | Data transmission protocol |
| `update_frequency` | min | number | 1 to 1440 | 15 | Remote update interval |
| `bandwidth_requirement` | kbps | number | 10 to 1000 | 100 | Network bandwidth needed |
| `cybersecurity_level` | - | select | basic/standard/enhanced | standard | Security measures |

### 11.5 AI/ML Integration

#### 11.5.1 Machine Learning Parameters

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `ml_model_type` | - | select | regression/classification/deep_learning | regression | ML algorithm type |
| `training_data_size` | samples | number | 100 to 1000000 | 10000 | Training dataset size |
| `model_update_trigger` | - | select | scheduled/performance/manual | performance | Update trigger |
| `prediction_confidence` | % | number | 0 to 100 | 95 | Confidence threshold |
| `feature_count` | - | number | 1 to 100 | 10 | Number of input features |

#### 11.5.2 Optimization Algorithms

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `optimization_objective` | - | select | power/efficiency/cost/multi | multi | Optimization goal |
| `optimization_algorithm` | - | select | gradient/genetic/PSO/bayesian | genetic | Optimization method |
| `convergence_criteria` | % | number | 0.01 to 10 | 1 | Convergence tolerance |
| `optimization_frequency` | h | number | 1 to 168 | 24 | Optimization interval |

---

## 12. Application-Specific Parameters

### 12.1 Wastewater Treatment Applications

#### 12.1.1 Influent Characteristics

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `wastewater_type` | - | select | domestic/industrial/agricultural/mixed | domestic | WW source |
| `influent_cod` | mg/L | number | 100 to 10000 | 500 | Influent COD |
| `influent_bod` | mg/L | number | 50 to 5000 | 250 | Influent BOD |
| `influent_tss` | mg/L | number | 50 to 1000 | 200 | Total suspended solids |
| `influent_tn` | mg/L | number | 10 to 200 | 40 | Total nitrogen |
| `influent_tp` | mg/L | number | 1 to 50 | 8 | Total phosphorus |
| `influent_temperature` | °C | number | 5 to 40 | 20 | WW temperature |
| `influent_ph` | - | number | 4 to 10 | 7 | WW pH |

#### 12.1.2 Treatment Performance

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `hydraulic_loading` | m³/m²/d | number | 0.1 to 10 | 1 | Surface loading rate |
| `organic_loading` | kg COD/m³/d | number | 0.1 to 20 | 2 | Volumetric loading |
| `sludge_production` | kg/kg COD | number | 0 to 0.5 | 0.1 | Sludge yield |
| `biogas_production` | L/g COD | number | 0 to 0.5 | 0.2 | Biogas from WW |
| `pathogen_removal` | log | number | 0 to 6 | 3 | Pathogen reduction |

### 12.2 Biosensor Applications

#### 12.2.1 Sensor Specifications

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `target_analyte` | - | select | BOD/toxicity/heavy_metals/pathogens | BOD | Detection target |
| `detection_limit` | μg/L | number | 0.001 to 1000 | 1 | Lower detection limit |
| `detection_range` | - | array | [0.001, 10000] | [1, 1000] | Measurement range |
| `response_time` | s | number | 1 to 3600 | 60 | Sensor response time |
| `selectivity` | - | number | 1 to 10 | 8 | Analyte selectivity |
| `stability` | days | number | 1 to 365 | 30 | Sensor lifetime |

#### 12.2.2 Biosensor Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `measurement_mode` | - | select | continuous/batch/on-demand | continuous | Operating mode |
| `calibration_frequency` | days | number | 1 to 90 | 7 | Calibration interval |
| `regeneration_method` | - | select | none/chemical/electrochemical | electrochemical | Sensor regeneration |
| `signal_type` | - | select | current/voltage/impedance | current | Output signal |

### 12.3 Space Applications

#### 12.3.1 Microgravity Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `gravity_level` | g | number | 0 to 1 | 0.000001 | Gravity acceleration |
| `bubble_management` | - | select | centrifugal/capillary/membrane | capillary | Gas-liquid separation |
| `fluid_containment` | - | select | sealed/membrane/surface_tension | membrane | Liquid containment |
| `orientation_independence` | - | boolean | true/false | true | Works in any orientation |

#### 12.3.2 Space Environment

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `radiation_tolerance` | Gy | number | 0 to 1000 | 100 | Radiation dose tolerance |
| `vacuum_compatibility` | - | boolean | true/false | false | Vacuum operation |
| `launch_survival_g` | g | number | 0 to 20 | 10 | Launch acceleration tolerance |
| `thermal_cycling` | cycles | number | 0 to 10000 | 1000 | Thermal cycle tolerance |

### 12.4 Agricultural Integration

#### 12.4.1 Fertigation Systems

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `nutrient_release_n` | mg/L/d | number | 0 to 100 | 10 | Nitrogen release rate |
| `nutrient_release_p` | mg/L/d | number | 0 to 50 | 5 | Phosphorus release rate |
| `nutrient_release_k` | mg/L/d | number | 0 to 100 | 20 | Potassium release rate |
| `ec_adjustment` | mS/cm | number | 0 to 5 | 2 | Electrical conductivity |
| `ph_buffering` | - | boolean | true/false | true | pH stabilization |

#### 12.4.2 Soil Integration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `soil_compatibility` | - | select | sandy/loamy/clay/all | all | Compatible soil types |
| `root_zone_placement` | cm | number | 0 to 100 | 30 | Depth of placement |
| `water_retention` | % | number | 0 to 50 | 20 | Water holding improvement |
| `cation_exchange` | meq/100g | number | 0 to 50 | 10 | CEC enhancement |

### 12.5 Medical Device Applications

#### 12.5.1 Implantable Systems

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `biocompatibility_iso` | - | select | 10993-5/10993-10/USP_VI | 10993-5 | ISO standard met |
| `device_volume` | mm³ | number | 1 to 10000 | 100 | Implant volume |
| `power_requirement` | μW | number | 1 to 1000 | 50 | Power needed |
| `lifetime_target` | years | number | 1 to 20 | 10 | Device lifetime |
| `sterilization_method` | - | select | EtO/gamma/e-beam/autoclave | gamma | Sterilization type |

#### 12.5.2 Wearable Systems

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `skin_contact_area` | cm² | number | 1 to 100 | 10 | Contact area |
| `flexibility` | % | number | 0 to 100 | 50 | Device flexibility |
| `moisture_resistance` | - | select | IP54/IP65/IP67/IP68 | IP65 | Ingress protection |
| `wireless_range` | m | number | 0.1 to 100 | 10 | Communication range |

### 12.6 Desalination Applications

#### 12.6.1 MDC Operation

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `salt_removal` | % | number | 0 to 99 | 90 | Desalination efficiency |
| `water_recovery` | % | number | 10 to 90 | 50 | Fresh water recovery |
| `energy_per_volume` | kWh/m³ | number | 0 to 5 | 1 | Energy per m³ water |
| `membrane_pairs` | - | number | 1 to 100 | 10 | Ion exchange membrane pairs |
| `current_efficiency` | % | number | 50 to 100 | 80 | Current utilization |

### 12.7 Carbon Capture Applications

#### 12.7.1 CO₂ Reduction

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `co2_capture_rate` | g/m²/d | number | 0 to 100 | 10 | CO₂ capture rate |
| `co2_conversion_product` | - | select | CH4/HCOOH/CH3OH/C2+ | HCOOH | Main product |
| `faradaic_efficiency_co2` | % | number | 0 to 100 | 70 | CO₂ reduction efficiency |
| `product_selectivity` | % | number | 0 to 100 | 80 | Target product selectivity |

---

## 13. Emerging Technology Parameters

### 13.1 Nanomaterial Integration

#### 13.1.1 Nanoparticle Properties

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `nanoparticle_size` | nm | number | 1 to 1000 | 50 | Average particle size |
| `size_distribution` | % | number | 5 to 50 | 20 | Size polydispersity |
| `nanoparticle_shape` | - | select | sphere/rod/sheet/irregular | sphere | Particle morphology |
| `surface_charge` | mV | number | -100 to 100 | -30 | Zeta potential |
| `surface_functionalization` | - | select | none/COOH/NH2/PEG/custom | none | Surface groups |

#### 13.1.2 Nanocomposite Integration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `loading_percentage` | wt% | number | 0.1 to 50 | 5 | Nanomaterial loading |
| `dispersion_quality` | - | number | 1 to 10 | 8 | Dispersion uniformity |
| `interface_strength` | MPa | number | 1 to 100 | 20 | Matrix-filler adhesion |
| `percolation_threshold` | wt% | number | 0.01 to 10 | 1 | Electrical percolation |

### 13.2 3D Printing & Additive Manufacturing

#### 13.2.1 Printing Parameters

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `printing_technology` | - | select | FDM/SLA/SLS/inkjet/bioprinting | FDM | 3D printing method |
| `layer_resolution` | μm | number | 10 to 1000 | 100 | Layer thickness |
| `printing_speed` | mm/s | number | 1 to 500 | 50 | Print head speed |
| `nozzle_temperature` | °C | number | 20 to 400 | 200 | Extruder temperature |
| `bed_temperature` | °C | number | 20 to 150 | 60 | Build plate temperature |

#### 13.2.2 Printable Materials

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `material_viscosity` | Pa·s | number | 0.001 to 10000 | 100 | Printing ink viscosity |
| `curing_method` | - | select | thermal/UV/chemical/none | thermal | Solidification method |
| `shrinkage_rate` | % | number | 0 to 20 | 5 | Post-printing shrinkage |
| `conductivity_printed` | S/m | number | 0 to 10000 | 100 | Printed conductivity |

### 13.3 Synthetic Biology Integration

#### 13.3.1 Genetic Engineering

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `vector_type` | - | select | plasmid/viral/chromosome | plasmid | Gene delivery method |
| `promoter_strength` | - | select | weak/medium/strong/inducible | medium | Expression level |
| `copy_number` | - | number | 1 to 1000 | 10 | Gene copies per cell |
| `expression_stability` | % | number | 0 to 100 | 90 | Stable expression rate |
| `metabolic_burden` | % | number | 0 to 50 | 10 | Growth rate reduction |

#### 13.3.2 Synthetic Pathways

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `pathway_length` | enzymes | number | 1 to 20 | 5 | Number of enzymes |
| `flux_balance` | % | number | 50 to 100 | 80 | Pathway balance |
| `cofactor_regeneration` | - | boolean | true/false | true | Cofactor recycling |
| `product_toxicity_threshold` | g/L | number | 0.1 to 100 | 10 | Toxic concentration |

### 13.4 Quantum Effects

#### 13.4.1 Quantum Enhancement

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `tunneling_distance` | nm | number | 0.1 to 10 | 1 | Electron tunneling range |
| `coherence_time` | ps | number | 0.1 to 1000 | 10 | Quantum coherence duration |
| `entanglement_efficiency` | % | number | 0 to 100 | 5 | Quantum entanglement |
| `quantum_yield` | % | number | 0 to 100 | 50 | Quantum efficiency |

### 13.5 Digital Twin Technology

#### 13.5.1 Model Fidelity

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `model_accuracy` | % | number | 50 to 99.9 | 90 | Twin prediction accuracy |
| `update_latency` | ms | number | 1 to 10000 | 100 | Data synchronization delay |
| `parameter_count` | - | number | 10 to 10000 | 100 | Model parameters |
| `computation_time` | s | number | 0.001 to 3600 | 1 | Simulation cycle time |

#### 13.5.2 Twin Applications

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `predictive_horizon` | h | number | 0.1 to 720 | 24 | Prediction time range |
| `scenario_count` | - | number | 1 to 1000 | 10 | Parallel scenarios |
| `optimization_frequency` | /h | number | 0.1 to 60 | 1 | Optimization rate |
| `anomaly_detection` | - | boolean | true/false | true | Fault detection enabled |

---

## 14. Integration & Scaling Parameters

### 14.1 Multi-Scale Integration

#### 14.1.1 Scale Transitions

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `lab_to_pilot_factor` | - | number | 10 to 1000 | 100 | Lab to pilot scale-up |
| `pilot_to_industrial_factor` | - | number | 10 to 1000 | 100 | Pilot to industrial |
| `scale_efficiency_loss` | % | number | 0 to 50 | 20 | Performance loss on scale-up |
| `scale_cost_factor` | - | number | 0.5 to 1 | 0.7 | Economy of scale factor |

#### 14.1.2 Modular Design

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `module_size` | kW | number | 0.1 to 1000 | 10 | Standard module capacity |
| `modules_per_system` | - | number | 1 to 1000 | 10 | Number of modules |
| `interconnection_loss` | % | number | 0 to 20 | 5 | Module connection losses |
| `redundancy_level` | % | number | 0 to 100 | 20 | Backup capacity |

### 14.2 Network Effects

#### 14.2.1 Multi-Reactor Networks

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `network_topology` | - | select | series/parallel/mesh/hierarchical | parallel | Network structure |
| `reactor_count` | - | number | 2 to 1000 | 10 | Reactors in network |
| `load_balancing` | - | select | static/dynamic/adaptive | dynamic | Load distribution |
| `network_efficiency` | % | number | 50 to 100 | 85 | Overall network efficiency |

#### 14.2.2 Communication Network

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `communication_latency` | ms | number | 1 to 1000 | 50 | Network latency |
| `data_throughput` | Mbps | number | 0.1 to 1000 | 10 | Data transfer rate |
| `network_reliability` | % | number | 90 to 99.999 | 99.9 | Uptime percentage |

### 14.3 Grid Integration

#### 14.3.1 Power Grid Connection

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `grid_voltage` | V | number | 100 to 100000 | 400 | Grid connection voltage |
| `power_factor` | - | number | 0.5 to 1 | 0.95 | Power factor |
| `harmonic_distortion` | % | number | 0 to 10 | 3 | THD percentage |
| `grid_synchronization` | - | boolean | true/false | true | Grid sync required |
| `islanding_protection` | - | boolean | true/false | true | Anti-islanding protection |

#### 14.3.2 Energy Storage Integration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `storage_capacity` | kWh | number | 0 to 10000 | 100 | Battery capacity |
| `storage_efficiency` | % | number | 50 to 99 | 85 | Round-trip efficiency |
| `charge_rate` | C | number | 0.1 to 10 | 1 | Charge rate |
| `discharge_rate` | C | number | 0.1 to 10 | 1 | Discharge rate |

### 14.4 Hybrid System Integration

#### 14.4.1 Renewable Integration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `solar_capacity` | kW | number | 0 to 10000 | 100 | Solar PV capacity |
| `wind_capacity` | kW | number | 0 to 10000 | 50 | Wind turbine capacity |
| `renewable_fraction` | % | number | 0 to 100 | 30 | Renewable energy share |
| `hybrid_control_mode` | - | select | follow_load/maximize_renewable | maximize_renewable | Control strategy |

#### 14.4.2 Process Integration

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `heat_recovery` | % | number | 0 to 90 | 50 | Waste heat utilization |
| `water_recovery` | % | number | 0 to 99 | 80 | Water reuse rate |
| `nutrient_recovery` | % | number | 0 to 99 | 70 | Nutrient recycling |
| `carbon_recovery` | % | number | 0 to 99 | 60 | Carbon capture rate |

### 14.5 Infrastructure Requirements

#### 14.5.1 Site Requirements

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `land_area` | m² | number | 10 to 100000 | 1000 | Total site area |
| `building_footprint` | m² | number | 10 to 10000 | 200 | Building area |
| `utility_connections` | - | array | - | [power, water, sewer] | Required utilities |
| `access_road_width` | m | number | 3 to 10 | 5 | Access road requirements |

#### 14.5.2 Utility Requirements

| Parameter | Unit | Type | Range | Default | Description |
|-----------|------|------|-------|---------|-------------|
| `power_connection` | kVA | number | 10 to 10000 | 100 | Electrical service size |
| `water_supply` | m³/d | number | 1 to 1000 | 10 | Water requirement |
| `wastewater_discharge` | m³/d | number | 0 to 1000 | 5 | Wastewater generation |
| `natural_gas` | m³/h | number | 0 to 1000 | 0 | Gas requirement |

---

## 15. Appendices

### Appendix A: Parameter Cross-References

#### A.1 Critical Parameter Dependencies

| Primary Parameter | Dependent Parameters | Relationship |
|-------------------|---------------------|--------------|
| `operating_temperature` | `microbial_growth_rate`, `reaction_kinetics`, `membrane_conductivity` | Arrhenius-type exponential |
| `ph_setpoint` | `microbial_activity`, `metal_solubility`, `membrane_stability` | Bell curve or threshold |
| `substrate_concentration` | `current_density`, `coulombic_efficiency`, `biofilm_thickness` | Monod kinetics |
| `flow_rate` | `reynolds_number`, `mass_transfer`, `shear_stress` | Linear to power law |
| `electrode_spacing` | `internal_resistance`, `mass_transfer`, `current_distribution` | Inverse relationship |

#### A.2 Constraint Relationships

| Parameter Set | Constraint | Description |
|---------------|------------|-------------|
| `temperature`, `pressure`, `volume` | PV = nRT | Ideal gas law for gas phase |
| `current`, `voltage`, `resistance` | V = IR | Ohm's law |
| `power`, `current`, `voltage` | P = IV | Power relationship |
| `efficiency_coulombic`, `efficiency_voltage` | η_energy = η_c × η_v | Energy efficiency |

### Appendix B: Unit Conversion Tables

#### B.1 Common Conversions

| Parameter Type | Unit Conversions |
|----------------|------------------|
| Power Density | 1 W/m³ = 0.001 kW/m³ = 1000 mW/L |
| Current Density | 1 A/m² = 0.1 mA/cm² = 1000 mA/m² |
| Concentration | 1 g/L = 1000 mg/L = 1000 ppm (dilute) |
| Pressure | 1 bar = 100 kPa = 14.5 psi = 0.987 atm |
| Flow Rate | 1 L/min = 60 L/h = 0.06 m³/h |

#### B.2 Energy Content

| Substrate | Energy Content | H₂ Equivalent |
|-----------|----------------|---------------|
| Glucose | 2.8 kWh/kg | 12 mol H₂/mol |
| Acetate | 1.0 kWh/kg | 4 mol H₂/mol |
| Methanol | 5.5 kWh/kg | 6 mol H₂/mol |
| Hydrogen | 33.3 kWh/kg | - |

### Appendix C: Standard Test Protocols

#### C.1 Electrochemical Characterization

1. **Polarization Curve**
   - Scan rate: 1 mV/s
   - Range: OCV to 0 V
   - Stabilization: 30 min at each point

2. **Electrochemical Impedance**
   - Frequency: 100 kHz to 10 mHz
   - Amplitude: 10 mV
   - Points per decade: 10

3. **Cyclic Voltammetry**
   - Scan rate: 1-50 mV/s
   - Potential range: -0.5 to +0.5 V vs Ag/AgCl
   - Cycles: 3-5 for stabilization

#### C.2 Biological Characterization

1. **Biofilm Quantification**
   - Crystal violet staining
   - Protein assay (Bradford/BCA)
   - Live/dead staining
   - Confocal microscopy

2. **Microbial Community Analysis**
   - 16S rRNA sequencing
   - qPCR for specific species
   - FISH visualization
   - Metabolomics

### Appendix D: Glossary of Terms

| Term | Definition |
|------|------------|
| **Anode** | Electrode where oxidation occurs (electron donor) |
| **Biofilm** | Structured community of microorganisms on a surface |
| **Cathode** | Electrode where reduction occurs (electron acceptor) |
| **Coulombic Efficiency** | Fraction of electrons recovered as current |
| **Electroactive** | Capable of electron transfer to/from electrodes |
| **HRT** | Hydraulic Retention Time - volume/flow rate |
| **Internal Resistance** | Total resistance within the system |
| **MEC** | Microbial Electrolysis Cell - produces H₂ |
| **MFC** | Microbial Fuel Cell - produces electricity |
| **OCV** | Open Circuit Voltage - voltage at zero current |
| **ORR** | Oxygen Reduction Reaction at cathode |
| **Overpotential** | Extra voltage needed beyond thermodynamic |

### Appendix E: References and Sources

1. **Books**
   - Logan, B.E. (2008). *Microbial Fuel Cells*. Wiley.
   - Rabaey, K. et al. (2010). *Bioelectrochemical Systems*. IWA Publishing.

2. **Key Review Papers**
   - Wang, H. & Ren, Z.J. (2013). "A comprehensive review of microbial electrochemical systems as a platform technology." *Biotechnology Advances*, 31(8), 1796-1807.
   - Santoro, C. et al. (2017). "Microbial fuel cells: From fundamentals to applications." *Journal of Power Sources*, 356, 225-244.

3. **Standards and Guidelines**
   - ISO 14040 series - Life Cycle Assessment
   - IEC 62282 - Fuel Cell Technologies
   - ASTM Standards for Electrochemical Testing

4. **Online Resources**
   - International Society for Microbial Electrochemistry and Technology (ISMET)
   - EU-ISMET Database of MFC Performance
   - DOE Fuel Cell Technologies Office

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-07-10 | Initial comprehensive release | MESSAi Team |

## Contributing to the Parameter Library

To suggest additions or modifications to this parameter library:

1. Submit a pull request with proposed changes
2. Include scientific references supporting new parameters
3. Ensure consistency with existing parameter structure
4. Add appropriate cross-references and dependencies
5. Update relevant appendices

---

*This document represents the collective knowledge of the microbial electrochemical systems community and will continue to evolve as the field advances.*