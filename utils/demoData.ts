// Mock data for demo mode

export const demoNotices = [
  {
    id: 'demo-notice-1',
    parentId: 'demo-parent',
    parentName: 'Sarah Demo (Parent)',
    title: 'Saturday Evening Babysitting',
    description: 'Looking for a responsible babysitter for our two kids (ages 5 and 8) on Saturday evening. We need someone who can prepare simple dinner, supervise playtime, and help with bedtime routine. Kids love arts & crafts and board games!',
    date: '2025-10-18',
    time: '6:00 PM - 11:00 PM',
    address: '123 Maple Street, Downtown, CA 94102',
    location: 'Downtown',
    payRate: 18,
    duration: '5 hours',
    ageGroup: '5, 8',
    status: 'open',
    createdAt: '2025-10-05T10:00:00.000Z',
    applications: [
      {
        id: 'demo-app-1',
        studentId: 'demo-student-1',
        studentName: 'Emma Johnson',
        message: 'Hi! I have 3 years of experience babysitting children ages 4-10. I love doing arts and crafts with kids and am CPR certified. I\'m available this Saturday and would love to help!',
        status: 'pending',
        appliedAt: '2025-10-06T14:30:00.000Z'
      },
      {
        id: 'demo-app-2',
        studentId: 'demo-student-2',
        studentName: 'Michael Chen',
        message: 'Hello! I\'m a sophomore at State University studying early childhood education. I have experience with children of all ages through my volunteer work at the community center. Looking forward to meeting your family!',
        status: 'pending',
        appliedAt: '2025-10-06T16:45:00.000Z'
      }
    ]
  },
  {
    id: 'demo-notice-2',
    parentId: 'demo-parent',
    parentName: 'Sarah Demo (Parent)',
    title: 'After School Care - Weekdays',
    description: 'Need a reliable babysitter to pick up my daughter from school and watch her until I get home from work (3:30 PM - 6:00 PM). Help with homework is a plus! She\'s in 3rd grade and loves reading.',
    date: '2025-10-14',
    time: '3:30 PM - 6:00 PM',
    address: '456 Oak Avenue, Near University, CA 94103',
    location: 'Near University',
    payRate: 15,
    duration: '2.5 hours',
    ageGroup: '8',
    status: 'filled',
    createdAt: '2025-10-03T09:00:00.000Z',
    applications: [
      {
        id: 'demo-app-3',
        studentId: 'demo-student-3',
        studentName: 'Jessica Martinez',
        message: 'I would love to help! I have experience tutoring elementary students and can definitely help with homework. I\'m very patient and reliable.',
        status: 'accepted',
        appliedAt: '2025-10-04T11:20:00.000Z'
      },
      {
        id: 'demo-app-4',
        studentId: 'demo-student-4',
        studentName: 'David Kim',
        message: 'Hi! I\'m available on weekdays and have experience with after-school care. I can help with homework and am happy to engage in educational activities.',
        status: 'rejected',
        appliedAt: '2025-10-04T15:00:00.000Z'
      }
    ]
  },
  {
    id: 'demo-notice-3',
    parentId: 'demo-parent-2',
    parentName: 'John Williams',
    title: 'Weekend Morning Childcare',
    description: 'Looking for someone to watch our energetic 4-year-old on Sunday mornings while we attend church. Must be comfortable with active play and outdoor activities.',
    date: '2025-10-13',
    time: '9:00 AM - 12:00 PM',
    address: '789 Pine Road, Suburbs, CA 94104',
    location: 'Suburbs',
    payRate: 16,
    duration: '3 hours',
    ageGroup: '4',
    status: 'open',
    createdAt: '2025-10-04T08:00:00.000Z',
    applications: []
  },
  {
    id: 'demo-notice-4',
    parentId: 'demo-parent-3',
    parentName: 'Lisa Anderson',
    title: 'Date Night Babysitter Needed',
    description: 'We have twin boys (age 6) who are very well-behaved. Need a sitter for Friday evening. Dinner will be prepared, just need help with supervision, playtime, and bedtime.',
    date: '2025-10-11',
    time: '7:00 PM - 11:00 PM',
    address: '321 Elm Street, Downtown, CA 94102',
    location: 'Downtown',
    payRate: 20,
    duration: '4 hours',
    ageGroup: '6, 6',
    status: 'open',
    createdAt: '2025-10-05T12:00:00.000Z',
    applications: [
      {
        id: 'demo-app-5',
        studentId: 'demo-student',
        studentName: 'Alex Demo (Student)',
        message: 'I would love to help! I have experience with twins and am very comfortable with bedtime routines. I\'m responsible, punctual, and love working with children.',
        status: 'pending',
        appliedAt: '2025-10-06T10:00:00.000Z'
      }
    ]
  }
];

export const demoStudentProfile = {
  id: 'demo-student',
  email: 'demo-student@example.com',
  name: 'Alex Demo (Student)',
  userType: 'student' as const,
  phone: '(555) 123-4567',
  age: 20,
  school: 'State University',
  bio: 'I\'m a junior studying Early Childhood Education with 4 years of babysitting experience. I\'m CPR and First Aid certified, and I absolutely love working with children of all ages. I\'m patient, creative, and always come prepared with fun activities!',
  interests: ['Arts & Crafts', 'Sports', 'Reading', 'Homework Help']
};

export const demoParentProfile = {
  id: 'demo-parent',
  email: 'demo-parent@example.com',
  name: 'Sarah Demo (Parent)',
  userType: 'parent' as const,
  phone: '(555) 987-6543',
  children: [
    {
      id: 'child-1',
      name: 'Emma',
      age: '8',
      gender: 'girl'
    },
    {
      id: 'child-2',
      name: 'Liam',
      age: '5',
      gender: 'boy'
    }
  ]
};

export const getNoticesForDemo = (userType: 'student' | 'parent') => {
  if (userType === 'student') {
    // Students see all open notices except their own applications
    return demoNotices.filter(notice => notice.status === 'open');
  } else {
    // Parents see only their own notices
    return demoNotices.filter(notice => notice.parentId === 'demo-parent');
  }
};

export const getApplicationsForStudent = () => {
  const applications: any[] = [];
  
  demoNotices.forEach(notice => {
    const userApplication = notice.applications.find(app => app.studentId === 'demo-student');
    if (userApplication) {
      applications.push({
        ...userApplication,
        notice: {
          id: notice.id,
          title: notice.title,
          date: notice.date,
          time: notice.time,
          location: notice.location,
          payRate: notice.payRate,
          parentName: notice.parentName
        }
      });
    }
  });
  
  return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
};
