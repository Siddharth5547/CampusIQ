const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/campuscare';

const users = [
  {
    name: 'Admin User',
    email: 'admin@campuscare.edu',
    password: 'Admin@123',
    role: 'admin',
    department: 'Administration'
  },
  {
    name: 'Rajesh Kumar',
    email: 'staff1@campuscare.edu',
    password: 'Staff@123',
    role: 'staff',
    department: 'Electrical Department'
  },
  {
    name: 'Priya Sharma',
    email: 'staff2@campuscare.edu',
    password: 'Staff@123',
    role: 'staff',
    department: 'Plumbing & Civil Department'
  },
  {
    name: 'Mohammed Ali',
    email: 'staff3@campuscare.edu',
    password: 'Staff@123',
    role: 'staff',
    department: 'IT Department'
  },
  {
    name: 'Arjun Mehta',
    email: 'student1@campuscare.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU2024001',
    department: 'Computer Science'
  },
  {
    name: 'Sneha Patel',
    email: 'student2@campuscare.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU2024002',
    department: 'Mechanical Engineering'
  },
  {
    name: 'Vikram Singh',
    email: 'student3@campuscare.edu',
    password: 'Student@123',
    role: 'student',
    studentId: 'STU2024003',
    department: 'Electronics'
  }
];

const generateComplaints = (userDocs) => {
  const admin = userDocs.find(u => u.role === 'admin');
  const staff1 = userDocs.find(u => u.email === 'staff1@campuscare.edu');
  const staff2 = userDocs.find(u => u.email === 'staff2@campuscare.edu');
  const staff3 = userDocs.find(u => u.email === 'staff3@campuscare.edu');
  const student1 = userDocs.find(u => u.email === 'student1@campuscare.edu');
  const student2 = userDocs.find(u => u.email === 'student2@campuscare.edu');
  const student3 = userDocs.find(u => u.email === 'student3@campuscare.edu');

  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  return [
    {
      title: 'Water leakage near Food Court restroom',
      description: 'Major water leakage from ceiling pipe near the Food Court restroom. Water is spreading on the floor creating a slip hazard. Over 25 students affected during lunch hours.',
      category: 'Plumbing',
      priority: 'High',
      status: 'Resolved',
      location: 'Food Court',
      block: 'Food Court Annex',
      roomArea: 'Near Restroom 102',
      reporter: student1._id,
      assignedTo: staff2._id,
      department: 'Plumbing & Civil Department',
      image: '/uploads/washroom_tap_before.svg',
      beforeImage: '/uploads/washroom_tap_before.svg',
      afterImage: '/uploads/washroom_tap_after.svg',
      upvotes: [student2._id, student3._id],
      upvoteCount: 27,
      resolutionNotes: 'Faulty brass mixer valve replaced with heavy-duty commercial unit. Area dried and anti-slip mat placed.',
      resolvedAt: hoursAgo(4),
      sla: {
        targetHours: 8,
        deadline: new Date(now.getTime() + 4 * 3600 * 1000),
        isBreached: false
      },
      aiAnalysis: {
        category: 'Plumbing',
        priority: 'High',
        department: 'Plumbing & Civil Department',
        location: 'Food Court',
        summary: 'Continuous water leakage near food court washroom causing safety hazard.',
        suggestedAction: 'Inspect nearby supply valve and replace faulty washer/cartridge.',
        reason: 'Continuous water leakage can create hygiene and safety concerns.',
        confidence: 94,
        method: 'rule-based'
      },
      verification: {
        status: 'Pending',
        notes: ''
      },
      statusHistory: [
        { status: 'Submitted', changedBy: student1._id, note: 'Complaint submitted.', timestamp: daysAgo(2) },
        { status: 'AI Analyzed', changedBy: admin._id, note: 'AI categorized as Plumbing (High priority).', timestamp: daysAgo(2) },
        { status: 'Assigned', changedBy: admin._id, note: 'Assigned to Priya Sharma.', timestamp: daysAgo(1.5) },
        { status: 'In Progress', changedBy: staff2._id, note: 'Parts procured, valve replacement underway.', timestamp: daysAgo(1) },
        { status: 'Resolved', changedBy: staff2._id, note: 'Repairs completed with proof photos.', timestamp: hoursAgo(4) }
      ],
      createdAt: daysAgo(2)
    },
    {
      title: 'Broken ceiling fan in Block 3, Room 301',
      description: 'The ceiling fan in room 301, Block 3 has stopped working completely. The room is hot and students are unable to study properly. The fan makes a loud clicking noise.',
      category: 'AC / Fan',
      priority: 'High',
      status: 'In Progress',
      location: 'Block 3',
      block: 'Block 3',
      roomArea: 'Room 301',
      reporter: student1._id,
      assignedTo: staff1._id,
      department: 'Electrical Department',
      upvotes: [student2._id],
      upvoteCount: 14,
      sla: {
        targetHours: 8,
        deadline: new Date(now.getTime() + 2 * 3600 * 1000),
        isBreached: false
      },
      aiAnalysis: {
        category: 'AC / Fan',
        priority: 'High',
        department: 'Electrical Department',
        summary: 'Ceiling fan motor failure in study room.',
        suggestedAction: 'Replace capacitor or motor bearing.',
        reason: 'Affects lecture room environment.',
        confidence: 89
      },
      statusHistory: [
        { status: 'Submitted', changedBy: student1._id, note: 'Reported.', timestamp: daysAgo(1) },
        { status: 'Assigned', changedBy: admin._id, note: 'Assigned to Rajesh Kumar.', timestamp: hoursAgo(18) },
        { status: 'In Progress', changedBy: staff1._id, note: 'Diagnostics underway.', timestamp: hoursAgo(5) }
      ],
      createdAt: daysAgo(1)
    },
    // Block 3 Plumbing cluster (for recurring issues intelligence)
    {
      title: 'Water pipe leak on Block 3 2nd floor',
      description: 'Persistent dripping from pipe joints along the corridor ceiling in Block 3 floor 2. Staining on the ceiling tiles.',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'In Progress',
      location: 'Block 3',
      block: 'Block 3',
      roomArea: '2nd Floor Corridor',
      reporter: student2._id,
      assignedTo: staff2._id,
      upvoteCount: 8,
      createdAt: daysAgo(5)
    },
    {
      title: 'Low water pressure in Block 3 washrooms',
      description: 'Taps on 3rd floor Block 3 barely have any water pressure during peak morning hours.',
      category: 'Plumbing',
      priority: 'Medium',
      status: 'Submitted',
      location: 'Block 3',
      block: 'Block 3',
      roomArea: '3rd Floor Restrooms',
      reporter: student3._id,
      upvoteCount: 12,
      createdAt: daysAgo(3)
    },
    {
      title: 'Drainage overflow near Block 3 ground floor',
      description: 'Outdoor drainage grating clogged with leaves and debris causing water to pool outside Block 3 entrance.',
      category: 'Plumbing',
      priority: 'High',
      status: 'Assigned',
      location: 'Block 3',
      block: 'Block 3',
      roomArea: 'Ground Floor Entry',
      reporter: student1._id,
      assignedTo: staff2._id,
      upvoteCount: 19,
      createdAt: daysAgo(2)
    },
    // Other locations for rich heatmap
    {
      title: 'Wi-Fi not working in Library study hall',
      description: 'The Wi-Fi network in the Library study hall is completely down. 50+ students cannot access online library catalogues.',
      category: 'Wi-Fi / Internet',
      priority: 'High',
      status: 'Closed',
      location: 'Library',
      block: 'Main Library',
      roomArea: 'Reading Hall Floor 2',
      reporter: student1._id,
      assignedTo: staff3._id,
      upvoteCount: 32,
      resolvedAt: daysAgo(1),
      createdAt: daysAgo(4)
    },
    {
      title: 'Broken fluorescent lights in Block 2 Room 205',
      description: '3 out of 6 lights in Room 205 have blown out. Room is too dark for projector presentations.',
      category: 'Electrical',
      priority: 'Medium',
      status: 'Submitted',
      location: 'Block 2',
      block: 'Block 2',
      roomArea: 'Room 205',
      reporter: student2._id,
      upvoteCount: 5,
      createdAt: daysAgo(1)
    },
    {
      title: 'Dirty washrooms and leaking basin in Hostel Block A',
      description: 'Floors uncleaned and tap dripping continuously in Hostel Block A 2nd floor.',
      category: 'Cleaning',
      priority: 'High',
      status: 'In Progress',
      location: 'Hostel',
      block: 'Hostel Block A',
      roomArea: '2nd Floor Washrooms',
      reporter: student3._id,
      assignedTo: staff2._id,
      upvoteCount: 22,
      createdAt: daysAgo(2)
    },
    {
      title: 'Garbage overflowing near Sports Complex entrance',
      description: 'Waste bins overflowing after weekend tournaments. Needs urgent clearing before evening matches.',
      category: 'Garbage',
      priority: 'Medium',
      status: 'Submitted',
      location: 'Sports Complex',
      block: 'Sports Pavilion',
      roomArea: 'Main Gate',
      reporter: student1._id,
      upvoteCount: 7,
      createdAt: hoursAgo(12)
    },
    {
      title: 'Air conditioning failure in Administrative Block Conference Room',
      description: 'AC unit blowing ambient air. Syndicate meeting room is unusable.',
      category: 'AC / Fan',
      priority: 'High',
      status: 'Assigned',
      location: 'Administrative Block',
      block: 'Admin Wing A',
      roomArea: 'Conference Room 101',
      reporter: student2._id,
      assignedTo: staff1._id,
      upvoteCount: 11,
      createdAt: daysAgo(1)
    },
    {
      title: 'Parking lot light pole 4 flickering and arcing',
      description: 'High mast light near South Parking is flickering aggressively with audible buzzing, potential electrical hazard.',
      category: 'Electrical',
      priority: 'Critical',
      status: 'Under Review',
      location: 'Parking',
      block: 'South Lot',
      roomArea: 'Pole #4',
      reporter: student3._id,
      upvoteCount: 16,
      sla: {
        targetHours: 2,
        deadline: new Date(now.getTime() + 1 * 3600 * 1000),
        isBreached: false
      },
      createdAt: hoursAgo(3)
    },
    {
      title: 'Water cooler stopped chilling in Block 4',
      description: '2nd floor dispenser dispensing lukewarm water.',
      category: 'Water Supply',
      priority: 'Medium',
      status: 'Closed',
      location: 'Block 4',
      block: 'Block 4',
      roomArea: 'Water Point #2',
      reporter: student1._id,
      assignedTo: staff2._id,
      upvoteCount: 9,
      resolvedAt: daysAgo(3),
      createdAt: daysAgo(8)
    },
    {
      title: 'Damaged laboratory workbenches in Block 1',
      description: 'Chemical acid burns and splintered edges on 4 chemistry tables in Lab 104.',
      category: 'Furniture',
      priority: 'Medium',
      status: 'Resolved',
      location: 'Block 1',
      block: 'Block 1',
      roomArea: 'Lab 104',
      reporter: student2._id,
      assignedTo: staff2._id,
      upvoteCount: 6,
      resolvedAt: daysAgo(2),
      createdAt: daysAgo(6)
    }
  ];
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Complaint.deleteMany({}),
      Notification.deleteMany({}),
      Feedback.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Create complaints
    const complaintData = generateComplaints(createdUsers);
    const createdComplaints = await Complaint.create(complaintData);
    console.log(`📋 Created ${createdComplaints.length} complaints`);

    // Create feedback for closed complaint
    const closedComplaint = createdComplaints.find(c => c.status === 'Closed');
    const student1 = createdUsers.find(u => u.email === 'student1@campuscare.edu');

    if (closedComplaint) {
      const feedback = await Feedback.create({
        complaint: closedComplaint._id,
        user: student1._id,
        rating: 5,
        comment: 'Excellent resolution time! Dual-band Wi-Fi was restored within 24 hours.',
        responseTime: 1
      });
      await Complaint.findByIdAndUpdate(closedComplaint._id, { feedback: feedback._id });
    }

    console.log('🎉 Database seeded successfully with CampusCare SaaS demo data!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
