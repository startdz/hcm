import { PrismaClient } from '../src/generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'
import { getDatabaseUrl } from '../src/database-url.js'

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding HRIS database...')

  const password = process.env.SEED_ADMIN_PASSWORD

  if (!password || password.length < 8) {
    throw new Error(
      'SEED_ADMIN_PASSWORD wajib diisi dan minimal 8 karakter.',
    )
  }

  const passwordHash = await hash(password, 12)

  // 1. Company
  let company = await prisma.company.findFirst({
    where: { name: 'PT HCM Tbk.' },
  })

  if (!company) {
    company = await prisma.company.create({
      data: { name: 'PT HCM Tbk.' },
    })
  }

  // 2. Departments
  const departmentNames = [
    'Human Resources',
    'Information Technology',
    'Finance',
  ]

  const departments = await Promise.all(
    departmentNames.map((name) =>
      prisma.department.upsert({
        where: {
          company_id_name: {
            company_id: company.id,
            name,
          },
        },
        update: {},
        create: {
          name,
          company_id: company.id,
        },
      }),
    ),
  )

  const hrDepartment = departments.find(
    (department) => department.name === 'Human Resources',
  )!

  const itDepartment = departments.find(
    (department) => department.name === 'Information Technology',
  )!

  // 3. Roles
  const roleDefinitions = [
    {
      code: 'SUPERADMIN',
      name: 'Super Administrator',
      description: 'Full system access',
      is_system: true,
    },
    {
      code: 'ADMIN',
      name: 'Administrator',
      description: 'Administrative access',
      is_system: true,
    },
    {
      code: 'HR_MANAGER',
      name: 'HR Manager',
      description: 'Human resources management',
      is_system: true,
    },
    {
      code: 'EMPLOYEE',
      name: 'Employee',
      description: 'Standard employee access',
      is_system: true,
    },
  ]

  const roles = await Promise.all(
    roleDefinitions.map((role) =>
      prisma.role.upsert({
        where: { code: role.code },
        update: {
          name: role.name,
          description: role.description,
        },
        create: role,
      }),
    ),
  )

  const roleByCode = Object.fromEntries(
    roles.map((role) => [role.code, role]),
  )

  // 4. Permissions
  const permissionDefinitions = [
    {
      code: 'employees.read',
      name: 'Read Employees',
      module: 'employees',
    },
    {
      code: 'employees.create',
      name: 'Create Employees',
      module: 'employees',
    },
    {
      code: 'employees.update',
      name: 'Update Employees',
      module: 'employees',
    },
    {
      code: 'employees.delete',
      name: 'Delete Employees',
      module: 'employees',
    },
    {
      code: 'leaves.read',
      name: 'Read Leave Types',
      module: 'leaves',
    },
    {
      code: 'leaves.create',
      name: 'Create Leave Requests',
      module: 'leaves',
    },
    {
      code: 'leaves.approve',
      name: 'Approve Leave Requests',
      module: 'leaves',
    },
    {
      code: 'users.manage',
      name: 'Manage Users',
      module: 'users',
    },
    {
      code: 'roles.manage',
      name: 'Manage Roles and Permissions',
      module: 'access_control',
    },
  ]

  const permissions = await Promise.all(
    permissionDefinitions.map((permission) =>
      prisma.permission.upsert({
        where: { code: permission.code },
        update: {
          name: permission.name,
          module: permission.module,
        },
        create: permission,
      }),
    ),
  )

  const permissionByCode = Object.fromEntries(
    permissions.map((permission) => [
      permission.code,
      permission,
    ]),
  )

  // 5. Role permissions
  const rolePermissionMap: Record<string, string[]> = {
    SUPERADMIN: permissionDefinitions.map(
      (permission) => permission.code,
    ),
    ADMIN: [
      'employees.read',
      'employees.create',
      'employees.update',
      'employees.delete',
      'leaves.read',
      'leaves.create',
      'leaves.approve',
      'users.manage',
    ],
    HR_MANAGER: [
      'employees.read',
      'employees.create',
      'employees.update',
      'leaves.read',
      'leaves.approve',
    ],
    EMPLOYEE: [
      'leaves.read',
      'leaves.create',
    ],
  }

  for (const [roleCode, permissionCodes] of Object.entries(
    rolePermissionMap,
  )) {
    for (const permissionCode of permissionCodes) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleByCode[roleCode].id,
            permission_id: permissionByCode[permissionCode].id,
          },
        },
        update: {},
        create: {
          role_id: roleByCode[roleCode].id,
          permission_id: permissionByCode[permissionCode].id,
        },
      })
    }
  }

  // 6. Admin user
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      password_hash: passwordHash,
      is_active: true,
    },
    create: {
      username: 'admin',
      email: 'admin@example.com',
      password_hash: passwordHash,
    },
  })

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.id,
        role_id: roleByCode.SUPERADMIN.id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.id,
      role_id: roleByCode.SUPERADMIN.id,
    },
  })

  // 7. HR employee account
  const hrUser = await prisma.user.upsert({
    where: { username: 'hr.manager' },
    update: {
      password_hash: passwordHash,
      is_active: true,
    },
    create: {
      username: 'hr.manager',
      email: 'hr.manager@example.com',
      password_hash: passwordHash,
    },
  })

  const hrEmployee = await prisma.employee.upsert({
    where: { emp_number: 'EMP-0001' },
    update: {
      first_name: 'HR',
      last_name: 'Manager',
      department_id: hrDepartment.id,
      user_id: hrUser.id,
    },
    create: {
      emp_number: 'EMP-0001',
      first_name: 'HR',
      last_name: 'Manager',
      department_id: hrDepartment.id,
      user_id: hrUser.id,
    },
  })

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: hrUser.id,
        role_id: roleByCode.HR_MANAGER.id,
      },
    },
    update: {},
    create: {
      user_id: hrUser.id,
      role_id: roleByCode.HR_MANAGER.id,
    },
  })

  // 8. Employee profile
  await prisma.employeeProfile.upsert({
    where: { employee_id: hrEmployee.id },
    update: {},
    create: {
      employee_id: hrEmployee.id,
      place_of_birth: 'Bandung',
      date_of_birth: new Date('1995-01-01T00:00:00.000Z'),
      phone_number: '081234567890',
      gender: 'MALE',
      marital_status: 'SINGLE',
    },
  })

  // 9. Employee address
  const existingAddress = await prisma.employeeAddress.findFirst({
    where: {
      employee_id: hrEmployee.id,
      label: 'Domisili',
    },
  })

  if (!existingAddress) {
    await prisma.employeeAddress.create({
      data: {
        employee_id: hrEmployee.id,
        country: 'Indonesia',
        city: 'Bandung',
        district: 'Coblong',
        subdistrict: 'Dago',
        zipcode: '40135',
        street: 'Jl. Contoh No. 1',
        full_address: 'Jl. Contoh No. 1, Dago, Bandung',
        label: 'Domisili',
        is_primary: true,
      },
    })
  }

  // 10. Emergency contact
  const existingContact =
    await prisma.employeeEmergencyContact.findFirst({
      where: {
        employee_id: hrEmployee.id,
        name: 'Emergency Contact Example',
      },
    })

  if (!existingContact) {
    await prisma.employeeEmergencyContact.create({
      data: {
        employee_id: hrEmployee.id,
        name: 'Emergency Contact Example',
        phone_number: '081234567891',
        relationship_status: 'FAMILY',
        address: 'Bandung, Indonesia',
      },
    })
  }

  // 11. Regular employee
  const employeeUser = await prisma.user.upsert({
    where: { username: 'employee.demo' },
    update: {
      password_hash: passwordHash,
      is_active: true,
    },
    create: {
      username: 'employee.demo',
      email: 'employee.demo@example.com',
      password_hash: passwordHash,
    },
  })

  const employee = await prisma.employee.upsert({
    where: { emp_number: 'EMP-0002' },
    update: {
      first_name: 'Demo',
      last_name: 'Employee',
      department_id: itDepartment.id,
      user_id: employeeUser.id,
    },
    create: {
      emp_number: 'EMP-0002',
      first_name: 'Demo',
      last_name: 'Employee',
      department_id: itDepartment.id,
      user_id: employeeUser.id,
    },
  })

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: employeeUser.id,
        role_id: roleByCode.EMPLOYEE.id,
      },
    },
    update: {},
    create: {
      user_id: employeeUser.id,
      role_id: roleByCode.EMPLOYEE.id,
    },
  })

  // 12. Leave types
  const leaveDefinitions = [
    {
      code: 'ANNUAL',
      name: 'Annual Leave',
      description: 'Annual paid leave',
      default_days: 12,
      is_paid: true,
      requires_approval: true,
    },
    {
      code: 'SICK',
      name: 'Sick Leave',
      description: 'Leave for illness',
      default_days: null,
      is_paid: true,
      requires_approval: true,
    },
    {
      code: 'UNPAID',
      name: 'Unpaid Leave',
      description: 'Leave without pay',
      default_days: null,
      is_paid: false,
      requires_approval: true,
    },
  ]

  for (const leave of leaveDefinitions) {
    await prisma.leave.upsert({
      where: { code: leave.code },
      update: {
        name: leave.name,
        description: leave.description,
        default_days: leave.default_days,
        is_paid: leave.is_paid,
        requires_approval: leave.requires_approval,
        is_active: true,
      },
      create: leave,
    })
  }

  console.log('✅ HRIS database seeded successfully')
  console.log(`🏢 Company: ${company.name}`)
  console.log(`🔐 Roles: ${roles.length}`)
  console.log(`🛡️ Permissions: ${permissions.length}`)
  console.log(`👤 Demo employee: ${employee.emp_number}`)
  console.log('🔑 Demo usernames: admin, hr.manager, employee.demo')
  console.log('🔑 All demo accounts use SEED_ADMIN_PASSWORD')
}

main()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
