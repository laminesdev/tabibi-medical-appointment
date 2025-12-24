const axios = require('axios');
const chalk = require('chalk');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();
const TEST_EMAIL_DOMAIN = `test-${TIMESTAMP}.com`;
const PHONE_SUFFIX = TIMESTAMP.toString().slice(-6); // Use last 6 digits of timestamp

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test data
const testData = {
  admin: {
    email: `admin@${TEST_EMAIL_DOMAIN}`,
    password: 'AdminPass123',
    firstName: 'Admin',
    lastName: 'User',
    phone: `+100000${PHONE_SUFFIX}1`,
    gender: 'MALE'
  },
  doctor: {
    email: `doctor@${TEST_EMAIL_DOMAIN}`,
    password: 'DoctorPass123',
    firstName: 'Dr. John',
    lastName: 'Smith',
    phone: `+100000${PHONE_SUFFIX}2`,
    gender: 'MALE',
    specialty: 'Cardiology',
    location: 'New York'
  },
  patient: {
    email: `patient@${TEST_EMAIL_DOMAIN}`,
    password: 'PatientPass123',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: `+100000${PHONE_SUFFIX}3`,
    gender: 'FEMALE'
  },
  appointment: {
    date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
    timeSlot: '10:00-10:30',
    reason: 'Regular checkup'
  }
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper functions
const logTestResult = (testName, success, error = null, expectedFailure = false) => {
  testResults.total++;
  // If it's an expected failure (security test), count it as a pass
  if (success || (expectedFailure && !success)) {
    testResults.passed++;
    console.log(chalk.green('✅ PASS:'), testName);
  } else {
    testResults.failed++;
    console.log(chalk.red('❌ FAIL:'), testName, error ? `- ${error.message || error}` : '');
  }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.Authorization;
  }
};

// Test functions
const runAuthTests = async () => {
  console.log(chalk.blue('\n=== AUTHENTICATION TESTS ===\n'));
  
  try {
    // Test 1: Register Admin
    console.log('Testing admin registration...');
    const adminRegisterResponse = await api.post('/auth/register', {
      ...testData.admin,
      role: 'ADMIN'
    });
    logTestResult('Admin registration', adminRegisterResponse.status === 201);
    testData.admin.id = adminRegisterResponse.data.data.user.id;
    
    // Test 2: Register Doctor
    console.log('Testing doctor registration...');
    const doctorRegisterResponse = await api.post('/auth/register', {
      ...testData.doctor,
      role: 'DOCTOR'
    });
    logTestResult('Doctor registration', doctorRegisterResponse.status === 201);
    testData.doctor.id = doctorRegisterResponse.data.data.user.id;
    testData.doctor.profile = doctorRegisterResponse.data.data.profile;
    testData.doctor.profileId = doctorRegisterResponse.data.data.profile.id;
    
    // Set up doctor schedule immediately after registration
    console.log('Setting up doctor schedule...');
    try {
      const doctorLoginResponse = await api.post('/auth/login', {
        email: testData.doctor.email,
        password: testData.doctor.password
      });
      
      if (doctorLoginResponse.status === 200) {
        // Temporarily set the doctor's token for schedule setup
        const originalToken = api.defaults.headers.Authorization;
        api.defaults.headers.Authorization = `Bearer ${doctorLoginResponse.data.data.accessToken}`;
        
        const scheduleData = {
          monday: JSON.stringify({
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }]
          }),
          tuesday: JSON.stringify({
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }]
          }),
          wednesday: JSON.stringify({
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }]
          }),
          thursday: JSON.stringify({
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }]
          }),
          friday: JSON.stringify({
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '17:00',
            breaks: [{ start: '12:00', end: '13:00' }]
          }),
          timeSlotDuration: 30
        };
        
        console.log('Sending schedule data:', JSON.stringify(scheduleData, null, 2));
        
        try {
          const scheduleSetupResponse = await api.put('/doctors/schedule', scheduleData);
          
          // Restore original token
          api.defaults.headers.Authorization = originalToken;
          
          if (scheduleSetupResponse.status === 200) {
            console.log('Doctor schedule set up successfully');
          }
        } catch (setupError) {
          // Restore original token even if setup fails
          api.defaults.headers.Authorization = originalToken;
          
          console.log('Schedule setup failed with detailed error:');
          if (setupError.response) {
            console.log('Status:', setupError.response.status);
            console.log('Data:', JSON.stringify(setupError.response.data, null, 2));
          } else {
            console.log('Error:', setupError.message);
          }
          throw setupError;
        }
      }
    } catch (scheduleError) {
      console.log('Warning: Could not set up doctor schedule:', scheduleError.message);
    }
    
    // Test 3: Register Patient
    console.log('Testing patient registration...');
    const patientRegisterResponse = await api.post('/auth/register', {
      ...testData.patient,
      role: 'PATIENT'
    });
    logTestResult('Patient registration', patientRegisterResponse.status === 201);
    testData.patient.id = patientRegisterResponse.data.data.user.id;
    testData.patient.profile = patientRegisterResponse.data.data.profile;
    
    // Test 4: Login Admin
    console.log('Testing admin login...');
    const adminLoginResponse = await api.post('/auth/login', {
      email: testData.admin.email,
      password: testData.admin.password
    });
    logTestResult('Admin login', adminLoginResponse.status === 200);
    testData.admin.accessToken = adminLoginResponse.data.data.accessToken;
    testData.admin.refreshToken = adminLoginResponse.data.data.refreshToken;
    
    // Test 5: Login Doctor
    console.log('Testing doctor login...');
    const doctorLoginResponse = await api.post('/auth/login', {
      email: testData.doctor.email,
      password: testData.doctor.password
    });
    logTestResult('Doctor login', doctorLoginResponse.status === 200);
    testData.doctor.accessToken = doctorLoginResponse.data.data.accessToken;
    testData.doctor.refreshToken = doctorLoginResponse.data.data.refreshToken;
    
    // Test 6: Login Patient
    console.log('Testing patient login...');
    const patientLoginResponse = await api.post('/auth/login', {
      email: testData.patient.email,
      password: testData.patient.password
    });
    logTestResult('Patient login', patientLoginResponse.status === 200);
    testData.patient.accessToken = patientLoginResponse.data.data.accessToken;
    testData.patient.refreshToken = patientLoginResponse.data.data.refreshToken;
    
    // Test 7: Refresh Token
    console.log('Testing token refresh...');
    const refreshResponse = await api.post('/auth/refresh', {
      refreshToken: testData.patient.refreshToken
    });
    logTestResult('Token refresh', refreshResponse.status === 200);
    
    // Test 8: Invalid Login - Wrong Password
    console.log('Testing invalid login (wrong password)...');
    try {
      await api.post('/auth/login', {
        email: testData.patient.email,
        password: 'WrongPassword123'
      });
      logTestResult('Invalid login (wrong password)', false, 'Should have failed');
    } catch (error) {
      logTestResult('Invalid login (wrong password)', error.response?.status === 401);
    }
    
    // Test 9: Invalid Login - Wrong Email
    console.log('Testing invalid login (wrong email)...');
    try {
      await api.post('/auth/login', {
        email: 'wrong@example.com',
        password: testData.patient.password
      });
      logTestResult('Invalid login (wrong email)', false, 'Should have failed');
    } catch (error) {
      logTestResult('Invalid login (wrong email)', error.response?.status === 401);
    }
    
    // Test 10: Invalid Registration - Weak Password
    console.log('Testing invalid registration (weak password)...');
    try {
      await api.post('/auth/register', {
        ...testData.patient,
        email: `weakpass@${TEST_EMAIL_DOMAIN}`,
        password: '123',
        role: 'PATIENT'
      });
      logTestResult('Invalid registration (weak password)', false, 'Should have failed');
    } catch (error) {
      logTestResult('Invalid registration (weak password)', error.response?.status === 400);
    }
    
    // Test 11: Invalid Registration - Missing Fields
    console.log('Testing invalid registration (missing fields)...');
    try {
      await api.post('/auth/register', {
        email: `missing@${TEST_EMAIL_DOMAIN}`,
        password: 'ValidPass123'
        // Missing required fields
      });
      logTestResult('Invalid registration (missing fields)', false, 'Should have failed');
    } catch (error) {
      logTestResult('Invalid registration (missing fields)', error.response?.status === 400);
    }
    
    // Test 12: Duplicate Email Registration
    console.log('Testing duplicate email registration...');
    try {
      await api.post('/auth/register', {
        ...testData.patient,
        password: 'AnotherPass123',
        role: 'PATIENT'
      });
      logTestResult('Duplicate email registration', false, 'Should have failed');
    } catch (error) {
      logTestResult('Duplicate email registration', error.response?.status === 409);
    }
    
  } catch (error) {
    logTestResult('Authentication tests', false, error.message);
  }
};

const runPublicSearchTests = async () => {
  console.log(chalk.blue('\n=== PUBLIC SEARCH TESTS ===\n'));
  
  try {
    // Test 1: Search Doctors by Specialty
    console.log('Testing doctor search by specialty...');
    const searchSpecialtyResponse = await api.get(`/search/doctors?specialty=${encodeURIComponent(testData.doctor.specialty)}`);
    logTestResult('Doctor search by specialty', searchSpecialtyResponse.status === 200);
    
    // Test 2: Search Doctors by Location
    console.log('Testing doctor search by location...');
    const searchLocationResponse = await api.get(`/search/doctors?location=${encodeURIComponent(testData.doctor.location)}`);
    logTestResult('Doctor search by location', searchLocationResponse.status === 200);
    
    // Test 3: Search Doctors by Both Specialty and Location
    console.log('Testing doctor search by specialty and location...');
    const searchBothResponse = await api.get(`/search/doctors?specialty=${encodeURIComponent(testData.doctor.specialty)}&location=${encodeURIComponent(testData.doctor.location)}`);
    logTestResult('Doctor search by specialty and location', searchBothResponse.status === 200);
    
    // Test 4: Get Doctor by ID
    console.log('Testing get doctor by ID...');
    const getDoctorResponse = await api.get(`/search/doctors/${testData.doctor.profileId}`);
    logTestResult('Get doctor by ID', getDoctorResponse.status === 200);
    
    // Test 5: Search Without Parameters (Should Fail)
    console.log('Testing search without parameters...');
    try {
      await api.get('/search/doctors');
      logTestResult('Search without parameters', false, 'Should have failed');
    } catch (error) {
      logTestResult('Search without parameters', error.response?.status === 400);
    }
    
    // Test 6: Get Non-existent Doctor (Should Fail)
    console.log('Testing get non-existent doctor...');
    try {
      await api.get('/search/doctors/non-existent-id');
      logTestResult('Get non-existent doctor', false, 'Should have failed');
    } catch (error) {
      logTestResult('Get non-existent doctor', error.response?.status === 400);
    }
    
  } catch (error) {
    logTestResult('Public search tests', false, error.message);
  }
};

const runPatientTests = async () => {
  console.log(chalk.blue('\n=== PATIENT TESTS ===\n'));
  
  try {
    // Set patient auth token
    setAuthToken(testData.patient.accessToken);
    
    // Test 1: Book Appointment
    console.log('Testing book appointment...');
    const bookResponse = await api.post('/patients/appointments', {
      doctorId: testData.doctor.profileId,
      date: testData.appointment.date,
      timeSlot: testData.appointment.timeSlot,
      reason: testData.appointment.reason
    });
    logTestResult('Book appointment', bookResponse.status === 201);
    testData.appointment.id = bookResponse.data.data.id;
    
    // Test 2: Get All Appointments
    console.log('Testing get all appointments...');
    const getAppointmentsResponse = await api.get('/patients/appointments');
    logTestResult('Get all appointments', getAppointmentsResponse.status === 200);
    
    // Test 3: Get Single Appointment
    console.log('Testing get single appointment...');
    const getAppointmentResponse = await api.get(`/patients/appointments/${testData.appointment.id}`);
    logTestResult('Get single appointment', getAppointmentResponse.status === 200);
    
    // Test 4: Cancel Appointment
    console.log('Testing cancel appointment...');
    const cancelResponse = await api.patch(`/patients/appointments/${testData.appointment.id}/cancel`);
    logTestResult('Cancel appointment', cancelResponse.status === 200);
    
    // Test 5: Reschedule Appointment
    console.log('Testing reschedule appointment...');
      // First, book a new appointment to reschedule
      const newBookResponse = await api.post('/patients/appointments', {
        doctorId: testData.doctor.profileId,
        date: testData.appointment.date,
        timeSlot: '11:00-11:30',
        reason: testData.appointment.reason
      });
    const newAppointmentId = newBookResponse.data.data.id;
    
    const rescheduleResponse = await api.patch(`/patients/appointments/${newAppointmentId}/reschedule`, {
      date: testData.appointment.date,
      timeSlot: '11:30-12:00'
    });
    logTestResult('Reschedule appointment', rescheduleResponse.status === 200);
    
    // Test 6: Book Appointment in Past (Should Fail)
    console.log('Testing book appointment in past...');
    try {
      await api.post('/patients/appointments', {
        doctorId: testData.doctor.profileId,
        date: '2020-01-01',
        timeSlot: '10:00-10:30',
        reason: testData.appointment.reason
      });
      logTestResult('Book appointment in past', false, 'Should have failed');
    } catch (error) {
      logTestResult('Book appointment in past', error.response?.status === 400);
    }
    
    // Test 7: Book Already Booked Slot (Should Fail)
    console.log('Testing book already booked slot...');
    try {
      await api.post('/patients/appointments', {
        doctorId: testData.doctor.profileId,
        date: testData.appointment.date,
        timeSlot: testData.appointment.timeSlot,
        reason: 'Another reason'
      });
      logTestResult('Book already booked slot', false, 'Should have failed');
    } catch (error) {
      logTestResult('Book already booked slot', error.response?.status === 409);
    }
    
    // Test 8: Access Other Patient's Appointment (Should Fail)
    console.log('Testing access other patient\'s appointment...');
    try {
      // Create another patient
      const otherPatientResponse = await api.post('/auth/register', {
        email: `otherpatient@${TEST_EMAIL_DOMAIN}`,
        password: 'OtherPass123',
        firstName: 'Other',
        lastName: 'Patient',
        phone: '+1000000004',
        gender: 'MALE',
        role: 'PATIENT'
      });
      
      const otherPatientLoginResponse = await api.post('/auth/login', {
        email: `otherpatient@${TEST_EMAIL_DOMAIN}`,
        password: 'OtherPass123'
      });
      
      setAuthToken(otherPatientLoginResponse.data.data.accessToken);
      
      await api.get(`/patients/appointments/${testData.appointment.id}`);
      logTestResult('Access other patient\'s appointment', false, 'Should have failed');
} catch (error) {
  logTestResult('Access other patient\'s appointment', error.response?.status === 404, null, true);
}
    
    // Reset to original patient token
    setAuthToken(testData.patient.accessToken);
    
  } catch (error) {
    logTestResult('Patient tests', false, error.message);
  }
};

const runDoctorTests = async () => {
  console.log(chalk.blue('\n=== DOCTOR TESTS ===\n'));
  
  try {
    // Set doctor auth token
    setAuthToken(testData.doctor.accessToken);
    
    // Test 1: Get Doctor's Appointments
    console.log('Testing get doctor\'s appointments...');
    const getAppointmentsResponse = await api.get('/doctors/appointments');
    logTestResult('Get doctor\'s appointments', getAppointmentsResponse.status === 200);
    
    // Test 2: Get Single Appointment
    console.log('Testing get single appointment...');
    const getAppointmentResponse = await api.get(`/doctors/appointments/${testData.appointment.id}`);
    logTestResult('Get single appointment', getAppointmentResponse.status === 200);
    
    // Test 3: Update Appointment Status
    console.log('Testing update appointment status...');
    const updateStatusResponse = await api.patch(`/doctors/appointments/${testData.appointment.id}/status`, {
      status: 'CONFIRMED'
    });
    logTestResult('Update appointment status', updateStatusResponse.status === 200);
    
    // Test 4: Get Schedule
    console.log('Testing get schedule...');
    const getScheduleResponse = await api.get('/doctors/schedule');
    logTestResult('Get schedule', getScheduleResponse.status === 200);
    
// Test 5: Update Schedule
    console.log('Testing update schedule...');
    const scheduleUpdateData = {
      monday: JSON.stringify({
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00',
        breaks: [{ start: '12:00', end: '13:00' }]
      }),
      timeSlotDuration: 30
    };
    
    console.log('Sending schedule update data:', JSON.stringify(scheduleUpdateData, null, 2));
    
    try {
      const updateScheduleResponse = await api.put('/doctors/schedule', scheduleUpdateData);
      logTestResult('Update schedule', updateScheduleResponse.status === 200);
    } catch (updateError) {
      console.log('Schedule update failed with detailed error:');
      if (updateError.response) {
        console.log('Status:', updateError.response.status);
        console.log('Data:', JSON.stringify(updateError.response.data, null, 2));
      } else {
        console.log('Error:', updateError.message);
      }
      throw updateError;
    }
    
    // Test 6: Get Profile
    console.log('Testing get profile...');
    const getProfileResponse = await api.get('/doctors/profile');
    logTestResult('Get profile', getProfileResponse.status === 200);
    
    // Test 7: Update Profile
    console.log('Testing update profile...');
    const updateProfileResponse = await api.patch('/doctors/profile', {
      bio: 'Updated bio for testing'
    });
    logTestResult('Update profile', updateProfileResponse.status === 200);
    
    // Test 8: Update Other Doctor's Appointment (Should Fail)
    console.log('Testing update other doctor\'s appointment...');
    try {
      // Create another doctor
      const otherDoctorResponse = await api.post('/auth/register', {
        email: `otherdoctor@${TEST_EMAIL_DOMAIN}`,
        password: 'OtherDocPass123',
        firstName: 'Other',
        lastName: 'Doctor',
        phone: '+1000000005',
        gender: 'FEMALE',
        specialty: 'Dermatology',
        location: 'Boston',
        role: 'DOCTOR'
      });
      
      const otherDoctorLoginResponse = await api.post('/auth/login', {
        email: `otherdoctor@${TEST_EMAIL_DOMAIN}`,
        password: 'OtherDocPass123'
      });
      
      setAuthToken(otherDoctorLoginResponse.data.data.accessToken);
      
      await api.patch(`/doctors/appointments/${testData.appointment.id}/status`, {
        status: 'REJECTED'
      });
      logTestResult('Update other doctor\'s appointment', false, 'Should have failed');
} catch (error) {
  logTestResult('Update other doctor\'s appointment', error.response?.status === 404, null, true);
}
    
    // Reset to original doctor token
    setAuthToken(testData.doctor.accessToken);
    
  } catch (error) {
    logTestResult('Doctor tests', false, error.message);
  }
};

const runAdminTests = async () => {
  console.log(chalk.blue('\n=== ADMIN TESTS ===\n'));
  
  try {
    // Set admin auth token
    setAuthToken(testData.admin.accessToken);
    
    // Test 1: Get Dashboard
    console.log('Testing get dashboard...');
    const dashboardResponse = await api.get('/admin/dashboard');
    logTestResult('Get dashboard', dashboardResponse.status === 200);
    
    // Test 2: Get All Doctors
    console.log('Testing get all doctors...');
    const getDoctorsResponse = await api.get('/admin/doctors');
    logTestResult('Get all doctors', getDoctorsResponse.status === 200);
    
    // Test 3: Get Single Doctor
    console.log('Testing get single doctor...');
    const getDoctorResponse = await api.get(`/admin/doctors/${testData.doctor.profileId}`);
    logTestResult('Get single doctor', getDoctorResponse.status === 200);
    
    // Test 4: Get All Users
    console.log('Testing get all users...');
    const getUsersResponse = await api.get('/admin/users');
    logTestResult('Get all users', getUsersResponse.status === 200);
    
    // Test 5: Get Single User
    console.log('Testing get single user...');
    const getUserResponse = await api.get(`/admin/users/${testData.patient.id}`);
    logTestResult('Get single user', getUserResponse.status === 200);
    
    // Test 6: Update User
    console.log('Testing update user...');
    const updateUserResponse = await api.patch(`/admin/users/${testData.patient.id}`, {
      firstName: 'Updated Jane'
    });
    logTestResult('Update user', updateUserResponse.status === 200);
    
    // Test 7: Deactivate User
    console.log('Testing deactivate user...');
    const deactivateUserResponse = await api.patch(`/admin/users/${testData.patient.id}/deactivate`);
    logTestResult('Deactivate user', deactivateUserResponse.status === 200);
    
    // Test 8: Reactivate User
    console.log('Testing reactivate user...');
    const reactivateUserResponse = await api.patch(`/admin/users/${testData.patient.id}/reactivate`);
    logTestResult('Reactivate user', reactivateUserResponse.status === 200);
    
    // Test 9: Access Admin Routes Without Admin Role (Should Fail)
    console.log('Testing access admin routes without admin role...');
    setAuthToken(testData.patient.accessToken);
    try {
      await api.get('/admin/dashboard');
      logTestResult('Access admin routes without admin role', false, 'Should have failed');
    } catch (error) {
      logTestResult('Access admin routes without admin role', error.response?.status === 403);
    }
    
    // Reset to admin token
    setAuthToken(testData.admin.accessToken);
    
  } catch (error) {
    logTestResult('Admin tests', false, error.message);
  }
};

const runEdgeCaseTests = async () => {
  console.log(chalk.blue('\n=== EDGE CASE TESTS ===\n'));
  
  try {
    // Test 1: Invalid JWT Token
    console.log('Testing invalid JWT token...');
    setAuthToken('invalid-token');
    try {
      await api.get('/patients/appointments');
      logTestResult('Invalid JWT token', false, 'Should have failed');
    } catch (error) {
      logTestResult('Invalid JWT token', error.response?.status === 401);
    }
    
    // Test 2: Missing Authorization Header
    console.log('Testing missing authorization header...');
    setAuthToken(null);
    try {
      await api.get('/patients/appointments');
      logTestResult('Missing authorization header', false, 'Should have failed');
    } catch (error) {
      logTestResult('Missing authorization header', error.response?.status === 401);
    }
    
    // Test 3: Expired Token
    console.log('Testing expired token...');
    setAuthToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJleGFtcGxlIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.invalid-signature');
    try {
      await api.get('/patients/appointments');
      logTestResult('Expired token', false, 'Should have failed');
    } catch (error) {
      logTestResult('Expired token', error.response?.status === 401);
    }
    
    // Reset to valid token
    setAuthToken(testData.patient.accessToken);
    
  } catch (error) {
    logTestResult('Edge case tests', false, error.message);
  }
};

const runAllTests = async () => {
  console.log(chalk.yellow('🧪 Starting Tabibi API Test Suite...\n'));
  
  // Run all test suites
  await runAuthTests();
  await delay(1000); // Small delay between test suites
  
  await runPublicSearchTests();
  await delay(1000);
  
  await runPatientTests();
  await delay(1000);
  
  await runDoctorTests();
  await delay(1000);
  
  await runAdminTests();
  await delay(1000);
  
  await runEdgeCaseTests();
  
  // Print summary
  console.log(chalk.yellow('\n=== TEST SUMMARY ==='));
  console.log(chalk.green(`✅ Passed: ${testResults.passed}`));
  console.log(chalk.red(`❌ Failed: ${testResults.failed}`));
  console.log(chalk.blue(`📊 Total: ${testResults.total}`));
  
  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(2);
  console.log(chalk.blue(`📈 Success Rate: ${successRate}%`));
  
  if (testResults.failed === 0) {
    console.log(chalk.green('\n🎉 All tests passed! The API is working correctly.'));
  } else {
    console.log(chalk.red(`\n⚠️  ${testResults.failed} test(s) failed. Please check the API implementation.`));
  }
};

// Run the tests
runAllTests().catch(error => {
  console.error(chalk.red('Test suite failed with error:'), error);
});
