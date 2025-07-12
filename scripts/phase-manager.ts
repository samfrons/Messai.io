#!/usr/bin/env tsx

/**
 * Phase Manager - Automated phase tracking and transitions for MESSAi
 * 
 * This script manages the project phases, tracks progress, and handles
 * automated transitions between phases.
 */

import fs from 'fs/promises'
import path from 'path'
import { format } from 'date-fns'

interface PhaseTask {
  id: string
  description: string
  completed: boolean
}

interface Phase {
  number: number
  name: string
  status: 'upcoming' | 'active' | 'completed'
  startDate?: string
  endDate?: string
  targetEndDate?: string
  progress: number
  tasks: PhaseTask[]
}

interface CurrentPhase {
  currentPhase: number
  phaseName: string
  status: string
  startDate: string
  targetEndDate: string
  completedTasks: string[]
  activeTasks: string[]
  upcomingTasks: string[]
  progress: number
  lastUpdated: string
}

class PhaseManager {
  private phasesDir = path.join(process.cwd(), 'phases')
  private currentPhaseFile = path.join(this.phasesDir, 'current-phase.json')

  async getCurrentPhase(): Promise<CurrentPhase> {
    try {
      const data = await fs.readFile(this.currentPhaseFile, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      throw new Error('Failed to read current phase file')
    }
  }

  async updateCurrentPhase(updates: Partial<CurrentPhase>): Promise<void> {
    const current = await this.getCurrentPhase()
    const updated = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString()
    }
    await fs.writeFile(this.currentPhaseFile, JSON.stringify(updated, null, 2))
  }

  async calculateProgress(phaseNumber: number): Promise<number> {
    const phaseFile = await this.findPhaseFile(phaseNumber)
    if (!phaseFile) return 0

    const content = await fs.readFile(phaseFile, 'utf-8')
    const completedTasks = (content.match(/✅/g) || []).length
    const totalTasks = (content.match(/Task \d+\.\d+:/g) || []).length
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  }

  async findPhaseFile(phaseNumber: number): Promise<string | null> {
    const dirs = ['active', 'completed', 'upcoming']
    
    for (const dir of dirs) {
      const files = await fs.readdir(path.join(this.phasesDir, dir))
      const phaseFile = files.find(f => f.includes(`phase-${phaseNumber}-`))
      if (phaseFile) {
        return path.join(this.phasesDir, dir, phaseFile)
      }
    }
    
    return null
  }

  async checkPhaseCompletion(): Promise<boolean> {
    const current = await this.getCurrentPhase()
    const progress = await this.calculateProgress(current.currentPhase)
    
    // Update progress
    await this.updateCurrentPhase({ progress })
    
    // Check if phase is complete (all tasks done)
    return progress === 100
  }

  async transitionToNextPhase(): Promise<void> {
    const current = await this.getCurrentPhase()
    const currentPhaseFile = await this.findPhaseFile(current.currentPhase)
    
    if (!currentPhaseFile) {
      throw new Error('Current phase file not found')
    }

    // Move current phase to completed
    if (currentPhaseFile.includes('/active/')) {
      const filename = path.basename(currentPhaseFile)
      const newPath = path.join(this.phasesDir, 'completed', filename)
      await fs.rename(currentPhaseFile, newPath)
      
      // Update the file to mark as completed
      let content = await fs.readFile(newPath, 'utf-8')
      content = content.replace('🔄', '✅')
      content = content.replace(/Status: Active.*/, `Status: Completed\n**Completion Date**: ${format(new Date(), 'yyyy-MM-dd')}`)
      await fs.writeFile(newPath, content)
    }

    // Find next phase
    const nextPhaseNumber = current.currentPhase + 1
    const nextPhaseFile = await this.findPhaseFile(nextPhaseNumber)
    
    if (nextPhaseFile && nextPhaseFile.includes('/upcoming/')) {
      // Move next phase to active
      const filename = path.basename(nextPhaseFile)
      const newPath = path.join(this.phasesDir, 'active', filename)
      await fs.rename(nextPhaseFile, newPath)
      
      // Update the file to mark as active
      let content = await fs.readFile(newPath, 'utf-8')
      content = content.replace('📅', '🔄')
      content = content.replace(/Status: Upcoming/, 'Status: Active')
      content = content.replace(/Planned Start: \d{4}-\d{2}-\d{2}/, `Start Date: ${format(new Date(), 'yyyy-MM-dd')}`)
      await fs.writeFile(newPath, content)
      
      // Update current phase tracking
      const phaseName = filename.match(/phase-\d+-(.+)\.md/)?.[1].replace(/-/g, ' ') || 'Unknown'
      await this.updateCurrentPhase({
        currentPhase: nextPhaseNumber,
        phaseName: phaseName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        status: 'active',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        progress: 0,
        completedTasks: [],
        activeTasks: [],
        upcomingTasks: []
      })
      
      console.log(`✅ Transitioned to Phase ${nextPhaseNumber}: ${phaseName}`)
    } else {
      console.log('🎉 All phases completed! Time to plan new features.')
    }
  }

  async generateStatusReport(): Promise<string> {
    const current = await this.getCurrentPhase()
    const progress = await this.calculateProgress(current.currentPhase)
    
    const report = `
# MESSAi Phase Status Report
Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}

## Current Phase
- **Phase ${current.currentPhase}**: ${current.phaseName}
- **Status**: ${current.status}
- **Progress**: ${progress}%
- **Started**: ${current.startDate}
- **Target End**: ${current.targetEndDate}

## Task Status
- **Completed**: ${current.completedTasks.length} tasks
- **Active**: ${current.activeTasks.length} tasks
- **Upcoming**: ${current.upcomingTasks.length} tasks

## Phase Overview
`
    
    // Add phase summaries
    const phases = [
      { num: 1, name: 'Foundation', status: 'completed' },
      { num: 2, name: 'Research System', status: 'completed' },
      { num: 3, name: 'Laboratory Tools', status: current.currentPhase === 3 ? 'active' : 'upcoming' },
      { num: 4, name: 'Integration', status: 'upcoming' },
      { num: 5, name: 'Experiment Platform', status: 'upcoming' }
    ]
    
    for (const phase of phases) {
      const phaseProgress = phase.num < current.currentPhase ? 100 : 
                           phase.num === current.currentPhase ? progress : 0
      report.concat(`\n### Phase ${phase.num}: ${phase.name}
- Status: ${phase.status}
- Progress: ${phaseProgress}%
`)
    }
    
    return report
  }
}

// CLI Commands
async function main() {
  const manager = new PhaseManager()
  const command = process.argv[2]
  
  try {
    switch (command) {
      case 'status':
        const current = await manager.getCurrentPhase()
        const progress = await manager.calculateProgress(current.currentPhase)
        console.log(`📊 Phase ${current.currentPhase}: ${current.phaseName}`)
        console.log(`   Progress: ${progress}%`)
        console.log(`   Status: ${current.status}`)
        break
        
      case 'check':
        const isComplete = await manager.checkPhaseCompletion()
        if (isComplete) {
          console.log('✅ Current phase is complete!')
          const answer = await prompt('Transition to next phase? (y/n): ')
          if (answer?.toLowerCase() === 'y') {
            await manager.transitionToNextPhase()
          }
        } else {
          const progress = await manager.calculateProgress((await manager.getCurrentPhase()).currentPhase)
          console.log(`⏳ Current phase is ${progress}% complete`)
        }
        break
        
      case 'report':
        const report = await manager.generateStatusReport()
        console.log(report)
        break
        
      case 'transition':
        await manager.transitionToNextPhase()
        break
        
      default:
        console.log(`
MESSAi Phase Manager

Usage:
  npm run phase:status    - Show current phase status
  npm run phase:check     - Check if current phase is complete
  npm run phase:report    - Generate full status report
  npm run phase:transition - Force transition to next phase
        `)
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Simple prompt helper
async function prompt(question: string): Promise<string> {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  
  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close()
      resolve(answer)
    })
  })
}

if (require.main === module) {
  main()
}