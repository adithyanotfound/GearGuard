import { PrismaClient, Role, RequestStage, Priority, MaintenanceType, StatusDot } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create users for each role
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const managerPassword = await bcrypt.hash('Manager123!', 10)
  const technicianPassword = await bcrypt.hash('Tech123!', 10)
  const employeePassword = await bcrypt.hash('Employee123!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gearguard.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gearguard.com',
      password: adminPassword,
      role: Role.ADMIN,
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@gearguard.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@gearguard.com',
      password: managerPassword,
      role: Role.MANAGER,
    },
  })

  const technician1 = await prisma.user.upsert({
    where: { email: 'tech1@gearguard.com' },
    update: {},
    create: {
      name: 'Technician One',
      email: 'tech1@gearguard.com',
      password: technicianPassword,
      role: Role.TECHNICIAN,
    },
  })

  const technician2 = await prisma.user.upsert({
    where: { email: 'tech2@gearguard.com' },
    update: {},
    create: {
      name: 'Technician Two',
      email: 'tech2@gearguard.com',
      password: technicianPassword,
      role: Role.TECHNICIAN,
    },
  })

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@gearguard.com' },
    update: {},
    create: {
      name: 'Employee One',
      email: 'employee1@gearguard.com',
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  })

  const employee2 = await prisma.user.upsert({
    where: { email: 'employee2@gearguard.com' },
    update: {},
    create: {
      name: 'Employee Two',
      email: 'employee2@gearguard.com',
      password: employeePassword,
      role: Role.EMPLOYEE,
    },
  })

  console.log('Created users')

  // Create categories
  const category1 = await prisma.equipmentCategory.upsert({
    where: { name: 'HVAC Systems' },
    update: {},
    create: {
      name: 'HVAC Systems',
      description: 'Heating, Ventilation, and Air Conditioning equipment',
    },
  })

  const category2 = await prisma.equipmentCategory.upsert({
    where: { name: 'Electrical' },
    update: {},
    create: {
      name: 'Electrical',
      description: 'Electrical equipment and systems',
    },
  })

  const category3 = await prisma.equipmentCategory.upsert({
    where: { name: 'Mechanical' },
    update: {},
    create: {
      name: 'Mechanical',
      description: 'Mechanical equipment and machinery',
    },
  })

  console.log('Created categories')

  // Create work centers
  const workCenter1 = await prisma.workCenter.upsert({
    where: { name: 'Building A' },
    update: {},
    create: {
      name: 'Building A',
      description: 'Main office building',
      location: '123 Main St',
    },
  })

  const workCenter2 = await prisma.workCenter.upsert({
    where: { name: 'Building B' },
    update: {},
    create: {
      name: 'Building B',
      description: 'Warehouse facility',
      location: '456 Industrial Ave',
    },
  })

  console.log('Created work centers')

  // Create teams
  const team1 = await prisma.team.upsert({
    where: { name: 'Maintenance Team Alpha' },
    update: {},
    create: {
      name: 'Maintenance Team Alpha',
      description: 'Primary maintenance team',
    },
  })

  const team2 = await prisma.team.upsert({
    where: { name: 'Maintenance Team Beta' },
    update: {},
    create: {
      name: 'Maintenance Team Beta',
      description: 'Secondary maintenance team',
    },
  })

  console.log('Created teams')

  // Create equipment
  const equipment1 = await prisma.equipment.create({
    data: {
      name: 'HVAC Unit 1',
      description: 'Main HVAC unit for Building A',
      serialNumber: 'HVAC-001',
      health: 85,
      categoryId: category1.id,
      workCenterId: workCenter1.id,
    },
  })

  const equipment2 = await prisma.equipment.create({
    data: {
      name: 'Electrical Panel A',
      description: 'Main electrical panel',
      serialNumber: 'ELEC-001',
      health: 92,
      categoryId: category2.id,
      workCenterId: workCenter1.id,
    },
  })

  const equipment3 = await prisma.equipment.create({
    data: {
      name: 'Conveyor Belt System',
      description: 'Warehouse conveyor system',
      serialNumber: 'MECH-001',
      health: 25, // Critical health
      categoryId: category3.id,
      workCenterId: workCenter2.id,
    },
  })

  const equipment4 = await prisma.equipment.create({
    data: {
      name: 'HVAC Unit 2',
      description: 'Secondary HVAC unit',
      serialNumber: 'HVAC-002',
      health: 70,
      categoryId: category1.id,
      workCenterId: workCenter2.id,
    },
  })

  console.log('Created equipment')

  // Create maintenance requests in different stages
  const request1 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'HVAC Unit 1 - Routine Maintenance',
      description: 'Scheduled preventive maintenance for HVAC Unit 1',
      stage: RequestStage.NEW,
      priority: Priority.MEDIUM,
      maintenanceType: MaintenanceType.PREVENTIVE,
      statusDot: StatusDot.WHITE,
      equipmentId: equipment1.id,
      categoryId: category1.id,
      teamId: team1.id,
      createdById: employee1.id,
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  })

  const request2 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Electrical Panel Inspection',
      description: 'Annual inspection of main electrical panel',
      stage: RequestStage.IN_PROGRESS,
      priority: Priority.HIGH,
      maintenanceType: MaintenanceType.PREVENTIVE,
      statusDot: StatusDot.GREEN,
      equipmentId: equipment2.id,
      categoryId: category2.id,
      teamId: team1.id,
      createdById: manager.id,
      assignedToId: technician1.id,
      scheduledDate: new Date(),
      duration: 120,
    },
  })

  const request3 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'Conveyor Belt Emergency Repair',
      description: 'Conveyor belt system failure - critical equipment',
      stage: RequestStage.IN_PROGRESS,
      priority: Priority.CRITICAL,
      maintenanceType: MaintenanceType.EMERGENCY,
      statusDot: StatusDot.RED,
      equipmentId: equipment3.id,
      categoryId: category3.id,
      teamId: team2.id,
      createdById: employee2.id,
      assignedToId: technician2.id,
      scheduledDate: new Date(),
      duration: 240,
    },
  })

  const request4 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'HVAC Unit 2 - Filter Replacement',
      description: 'Replace air filters in HVAC Unit 2',
      stage: RequestStage.REPAIRED,
      priority: Priority.LOW,
      maintenanceType: MaintenanceType.CORRECTIVE,
      statusDot: StatusDot.GREEN,
      equipmentId: equipment4.id,
      categoryId: category1.id,
      teamId: team1.id,
      createdById: employee1.id,
      assignedToId: technician1.id,
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: 30,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  })

  const request5 = await prisma.maintenanceRequest.create({
    data: {
      subject: 'New Equipment Setup',
      description: 'Setup new equipment in Building A',
      stage: RequestStage.NEW,
      priority: Priority.MEDIUM,
      maintenanceType: MaintenanceType.PREVENTIVE,
      statusDot: StatusDot.WHITE,
      workCenterId: workCenter1.id,
      categoryId: category1.id,
      createdById: employee2.id,
    },
  })

  console.log('Created maintenance requests')

  // Add some notes
  await prisma.requestNote.create({
    data: {
      content: 'Initial inspection completed. Found minor issues.',
      requestId: request2.id,
      createdById: technician1.id,
    },
  })

  await prisma.requestNote.create({
    data: {
      content: 'Emergency repair in progress. Parts ordered.',
      requestId: request3.id,
      createdById: technician2.id,
    },
  })

  console.log('Created notes')

  console.log('Seeding completed!')
  console.log('\nTest accounts:')
  console.log('Admin: admin@gearguard.com / Admin123!')
  console.log('Manager: manager@gearguard.com / Manager123!')
  console.log('Technician: tech1@gearguard.com / Tech123!')
  console.log('Employee: employee1@gearguard.com / Employee123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

