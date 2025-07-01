import React from 'react'
import styles from './AlgalFuelCell.module.css'
import { algaeDatabase, electrodesDatabase, mediatorsDatabase, separatorsDatabase } from './AlgalFuelCellDatabase'

interface ParameterControlsProps {
  parameters: any
  onParameterChange: (category: string, param: string, value: any) => void
  activeTab: string
  advancedMode: boolean
}

export default function ParameterControls({ 
  parameters, 
  onParameterChange, 
  activeTab, 
  advancedMode 
}: ParameterControlsProps) {
  
  const formatValue = (value: number, unit: string) => {
    return `${value}${unit}`
  }

  return (
    <>
      {/* Biological Tab */}
      <div className={`${styles.tabContent} ${activeTab === 'biological' ? styles.active : ''}`}>
        {/* Algae Configuration */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🦠</span>
            Algae Configuration
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Algae Species
              <span className={styles.parameterValue}>
                {algaeDatabase[parameters.algae.type as keyof typeof algaeDatabase]?.name || parameters.algae.type}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.algae.type}
              onChange={(e) => onParameterChange('algae', 'type', e.target.value)}
            >
              {Object.entries(algaeDatabase).map(([key, algae]) => (
                <option key={key} value={key}>{algae.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Cell Density
              <span className={styles.parameterValue}>
                {parameters.algae.density} × 10⁶ cells/mL
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0.1"
              max="50"
              step="0.1"
              value={parameters.algae.density}
              onChange={(e) => onParameterChange('algae', 'density', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Culture Volume
              <span className={styles.parameterValue}>
                {parameters.algae.volume} mL
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="1"
              max="5000"
              step="10"
              value={parameters.algae.volume}
              onChange={(e) => onParameterChange('algae', 'volume', parseFloat(e.target.value))}
            />
          </div>

          {advancedMode && (
            <>
              <div className={styles.parameterGroup}>
                <label className={styles.parameterLabel}>
                  Growth Phase
                  <span className={styles.parameterValue}>
                    {parameters.algae.growthPhase}
                  </span>
                </label>
                <select
                  className={styles.select}
                  value={parameters.algae.growthPhase}
                  onChange={(e) => onParameterChange('algae', 'growthPhase', e.target.value)}
                >
                  <option value="lag">Lag Phase</option>
                  <option value="exponential">Exponential Phase</option>
                  <option value="stationary">Stationary Phase</option>
                  <option value="decline">Decline Phase</option>
                </select>
              </div>

              <div className={styles.parameterGroup}>
                <label className={styles.parameterLabel}>
                  Biofilm Formation
                  <span className={styles.parameterValue}>
                    {parameters.algae.biofilm}%
                  </span>
                </label>
                <input
                  type="range"
                  className={styles.range}
                  min="0"
                  max="100"
                  step="5"
                  value={parameters.algae.biofilm}
                  onChange={(e) => onParameterChange('algae', 'biofilm', parseFloat(e.target.value))}
                />
              </div>
            </>
          )}
        </div>

        {/* Mediator Configuration */}
        {advancedMode && (
          <div className={styles.parameterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⚗️</span>
              Electron Mediators
            </h3>
            
            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Mediator Type
                <span className={styles.parameterValue}>
                  {parameters.mediators.types.join(', ')}
                </span>
              </label>
              <select
                className={styles.select}
                value={parameters.mediators.types[0]}
                onChange={(e) => onParameterChange('mediators', 'types', [e.target.value])}
              >
                {Object.entries(mediatorsDatabase).map(([key, mediator]) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>

            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Mediator Concentration
                <span className={styles.parameterValue}>
                  {parameters.mediators.concentration} mM
                </span>
              </label>
              <input
                type="range"
                className={styles.range}
                min="0"
                max="10"
                step="0.1"
                value={parameters.mediators.concentration}
                onChange={(e) => onParameterChange('mediators', 'concentration', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Culture Medium */}
        {advancedMode && (
          <div className={styles.parameterSection}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🧪</span>
              Culture Medium
            </h3>
            
            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Medium Type
                <span className={styles.parameterValue}>
                  {parameters.medium.type.toUpperCase()}
                </span>
              </label>
              <select
                className={styles.select}
                value={parameters.medium.type}
                onChange={(e) => onParameterChange('medium', 'type', e.target.value)}
              >
                <option value="bg11">BG-11</option>
                <option value="tap">TAP</option>
                <option value="bold">Bold's Basal Medium</option>
                <option value="f2">f/2 Medium</option>
                <option value="zarrouk">Zarrouk's Medium</option>
              </select>
            </div>

            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Nitrogen Source
                <span className={styles.parameterValue}>
                  {parameters.medium.nitrogen}
                </span>
              </label>
              <select
                className={styles.select}
                value={parameters.medium.nitrogen}
                onChange={(e) => onParameterChange('medium', 'nitrogen', e.target.value)}
              >
                <option value="nitrate">Nitrate (NO₃⁻)</option>
                <option value="ammonium">Ammonium (NH₄⁺)</option>
                <option value="urea">Urea</option>
                <option value="mixed">Mixed N sources</option>
              </select>
            </div>

            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Phosphate Concentration
                <span className={styles.parameterValue}>
                  {parameters.medium.phosphate} mM
                </span>
              </label>
              <input
                type="range"
                className={styles.range}
                min="0.1"
                max="10"
                step="0.1"
                value={parameters.medium.phosphate}
                onChange={(e) => onParameterChange('medium', 'phosphate', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Materials Tab */}
      <div className={`${styles.tabContent} ${activeTab === 'materials' ? styles.active : ''}`}>
        {/* Electrode Configuration */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚡</span>
            Electrode Configuration
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Anode Material
              <span className={styles.parameterValue}>
                {parameters.electrodes.anodeMaterial}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.electrodes.anodeMaterial}
              onChange={(e) => onParameterChange('electrodes', 'anodeMaterial', e.target.value)}
            >
              {Object.keys(electrodesDatabase.anode).map(material => (
                <option key={material} value={material}>
                  {material.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Cathode Material
              <span className={styles.parameterValue}>
                {parameters.electrodes.cathodeMaterial}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.electrodes.cathodeMaterial}
              onChange={(e) => onParameterChange('electrodes', 'cathodeMaterial', e.target.value)}
            >
              {Object.keys(electrodesDatabase.cathode).map(material => (
                <option key={material} value={material}>
                  {material.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Electrode Surface Area
              <span className={styles.parameterValue}>
                {parameters.electrodes.area} cm²
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0.1"
              max="500"
              step="0.1"
              value={parameters.electrodes.area}
              onChange={(e) => onParameterChange('electrodes', 'area', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Electrode Separation
              <span className={styles.parameterValue}>
                {parameters.electrodes.separation} cm
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0.1"
              max="20"
              step="0.1"
              value={parameters.electrodes.separation}
              onChange={(e) => onParameterChange('electrodes', 'separation', parseFloat(e.target.value))}
            />
          </div>

          {advancedMode && (
            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Surface Modification
                <span className={styles.parameterValue}>
                  {parameters.electrodes.surfaceModification}
                </span>
              </label>
              <select
                className={styles.select}
                value={parameters.electrodes.surfaceModification}
                onChange={(e) => onParameterChange('electrodes', 'surfaceModification', e.target.value)}
              >
                <option value="none">None</option>
                <option value="plasma">Plasma Treatment</option>
                <option value="acid">Acid Treatment</option>
                <option value="polymer">Polymer Coating</option>
                <option value="metal-nanoparticles">Metal Nanoparticles</option>
                <option value="enzyme">Enzyme Immobilization</option>
              </select>
            </div>
          )}
        </div>

        {/* Separator Configuration */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔲</span>
            Separator/Membrane
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Separator Type
              <span className={styles.parameterValue}>
                {parameters.separator.type.toUpperCase()}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.separator.type}
              onChange={(e) => onParameterChange('separator', 'type', e.target.value)}
            >
              {Object.keys(separatorsDatabase).map(type => (
                <option key={type} value={type}>
                  {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Separator Thickness
              <span className={styles.parameterValue}>
                {parameters.separator.thickness} mm
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0.01"
              max="5"
              step="0.01"
              value={parameters.separator.thickness}
              onChange={(e) => onParameterChange('separator', 'thickness', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Environment Tab */}
      <div className={`${styles.tabContent} ${activeTab === 'environment' ? styles.active : ''}`}>
        {/* Light Conditions */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>💡</span>
            Light Conditions
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Light Intensity
              <span className={styles.parameterValue}>
                {parameters.environment.lightIntensity} μmol/m²/s
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0"
              max="1000"
              step="10"
              value={parameters.environment.lightIntensity}
              onChange={(e) => onParameterChange('environment', 'lightIntensity', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Light Spectrum
              <span className={styles.parameterValue}>
                {parameters.environment.lightSpectrum}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.environment.lightSpectrum}
              onChange={(e) => onParameterChange('environment', 'lightSpectrum', e.target.value)}
            >
              <option value="white">White Light</option>
              <option value="red-blue">Red-Blue Mix</option>
              <option value="full-spectrum">Full Spectrum</option>
              <option value="red">Red (660nm)</option>
              <option value="blue">Blue (450nm)</option>
              <option value="green">Green (520nm)</option>
            </select>
          </div>
        </div>

        {/* Environmental Parameters */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🌡️</span>
            Environmental Parameters
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Temperature
              <span className={styles.parameterValue}>
                {parameters.environment.temperature}°C
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="4"
              max="50"
              step="0.5"
              value={parameters.environment.temperature}
              onChange={(e) => onParameterChange('environment', 'temperature', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              pH Level
              <span className={styles.parameterValue}>
                {parameters.environment.ph}
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="4"
              max="11"
              step="0.1"
              value={parameters.environment.ph}
              onChange={(e) => onParameterChange('environment', 'ph', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              CO₂ Concentration
              <span className={styles.parameterValue}>
                {parameters.environment.co2}%
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0"
              max="20"
              step="0.5"
              value={parameters.environment.co2}
              onChange={(e) => onParameterChange('environment', 'co2', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Electrical Tab */}
      <div className={`${styles.tabContent} ${activeTab === 'electrical' ? styles.active : ''}`}>
        {/* Electrical Configuration */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔌</span>
            Electrical Configuration
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              External Resistance
              <span className={styles.parameterValue}>
                {parameters.electrical.externalResistance} Ω
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="1"
              max="10000"
              step="10"
              value={parameters.electrical.externalResistance}
              onChange={(e) => onParameterChange('electrical', 'externalResistance', parseFloat(e.target.value))}
            />
          </div>

          {advancedMode && (
            <>
              <div className={styles.parameterGroup}>
                <label className={styles.parameterLabel}>
                  Connection Type
                  <span className={styles.parameterValue}>
                    {parameters.electrical.connectionType}
                  </span>
                </label>
                <select
                  className={styles.select}
                  value={parameters.electrical.connectionType}
                  onChange={(e) => onParameterChange('electrical', 'connectionType', e.target.value)}
                >
                  <option value="single">Single Cell</option>
                  <option value="series">Series Stack</option>
                  <option value="parallel">Parallel Stack</option>
                  <option value="series-parallel">Series-Parallel</option>
                </select>
              </div>

              <div className={styles.parameterGroup}>
                <label className={styles.parameterLabel}>
                  Number of Cells
                  <span className={styles.parameterValue}>
                    {parameters.electrical.cellCount}
                  </span>
                </label>
                <input
                  type="range"
                  className={styles.range}
                  min="1"
                  max="20"
                  step="1"
                  value={parameters.electrical.cellCount}
                  onChange={(e) => onParameterChange('electrical', 'cellCount', parseInt(e.target.value))}
                />
              </div>
            </>
          )}
        </div>

        {/* Operation Mode */}
        <div className={styles.parameterSection}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>⚙️</span>
            Operation Mode
          </h3>
          
          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Operation Mode
              <span className={styles.parameterValue}>
                {parameters.flow.operationMode}
              </span>
            </label>
            <select
              className={styles.select}
              value={parameters.flow.operationMode}
              onChange={(e) => onParameterChange('flow', 'operationMode', e.target.value)}
            >
              <option value="batch">Batch</option>
              <option value="fed-batch">Fed-Batch</option>
              <option value="continuous">Continuous Flow</option>
            </select>
          </div>

          {parameters.flow.operationMode !== 'batch' && (
            <div className={styles.parameterGroup}>
              <label className={styles.parameterLabel}>
                Flow Rate
                <span className={styles.parameterValue}>
                  {parameters.flow.flowRate} mL/min
                </span>
              </label>
              <input
                type="range"
                className={styles.range}
                min="0"
                max="100"
                step="0.5"
                value={parameters.flow.flowRate}
                onChange={(e) => onParameterChange('flow', 'flowRate', parseFloat(e.target.value))}
              />
            </div>
          )}

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Mixing Speed
              <span className={styles.parameterValue}>
                {parameters.flow.mixingSpeed} RPM
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0"
              max="1000"
              step="10"
              value={parameters.flow.mixingSpeed}
              onChange={(e) => onParameterChange('flow', 'mixingSpeed', parseFloat(e.target.value))}
            />
          </div>

          <div className={styles.parameterGroup}>
            <label className={styles.parameterLabel}>
              Aeration Rate
              <span className={styles.parameterValue}>
                {parameters.flow.aerationRate} vvm
              </span>
            </label>
            <input
              type="range"
              className={styles.range}
              min="0"
              max="5"
              step="0.1"
              value={parameters.flow.aerationRate}
              onChange={(e) => onParameterChange('flow', 'aerationRate', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </>
  )
}