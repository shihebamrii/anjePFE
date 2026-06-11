import mongoose from 'mongoose';
import dotenv from 'dotenv';
import xlsx from 'xlsx';
import User from '../models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI is required in .env');
  process.exit(1);
}

const OUTPUT_FILENAME = 'users_export.xlsx';

async function exportUsers({ updateDbPassword = false } = {}) {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for user export.');

  const users = await User.find({}).select('+password').lean();
  if (!users.length) {
    console.log('No users found to export.');
    await mongoose.disconnect();
    return;
  }

  const rows = users.map((u) => ({
    id: u._id?.toString() ?? '',
    firstName: u.firstName || '',
    lastName: u.lastName || '',
    email: u.email || '',
    role: u.role || '',
    avatar: u.avatar || '',
    isActive: u.isActive ?? false,
    department: u.department || '',
    studentId: u.studentId || '',
    registrationNumber: u.registrationNumber || '',
    classId: u.classId?.toString() || '',
    className: u.className || '',
    teacherId: u.teacherId || '',
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : '',
    updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : '',
    password: 'iset123',
  }));

  const sheet = xlsx.utils.json_to_sheet(rows);

  // Friendly header labels in Excel
  const niceHeader = {
    id: 'ID',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    role: 'Role',
    avatar: 'Avatar URL',
    isActive: 'Active',
    department: 'Department',
    studentId: 'Student ID',
    registrationNumber: 'Registration #',
    classId: 'Class ID',
    className: 'Class Name',
    teacherId: 'Teacher ID',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
    password: 'Password',
  };

  // apply header labels and style
  const keys = Object.keys(niceHeader);
  const headerStyle = {
    font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: 'FFFFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb: 'FF0070C0' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'FF000000' } },
      bottom: { style: 'thin', color: { rgb: 'FF000000' } },
      left: { style: 'thin', color: { rgb: 'FF000000' } },
      right: { style: 'thin', color: { rgb: 'FF000000' } },
    },
  };

  keys.forEach((key, index) => {
    const cellRef = xlsx.utils.encode_cell({ c: index, r: 0 });
    if (!sheet[cellRef]) return;
    sheet[cellRef].v = niceHeader[key];
    sheet[cellRef].s = headerStyle;
  });

  // set widths based on content
  const colWidths = keys.map((key) => {
    const maxLength = Math.max(
      niceHeader[key].length,
      ...rows.map((r) => (r[key] ? r[key].toString().length : 0)),
      10
    );
    return { wch: Math.min(Math.max(maxLength, 12), 35) };
  });
  sheet['!cols'] = colWidths;

  // set row heights and text wrap for body rows
  sheet['!rows'] = [{ hpt: 22 }];
  const rowCount = rows.length + 1;
  for (let r = 1; r < rowCount; r += 1) {
    if (!sheet['!rows'][r]) sheet['!rows'][r] = {};
    sheet['!rows'][r].hpt = 18;
  }

  // date formatting for createdAt/updatedAt
  for (let r = 1; r < rowCount; r += 1) {
    ['createdAt', 'updatedAt'].forEach((field) => {
      const c = keys.indexOf(field);
      if (c < 0) return;
      const cellRef = xlsx.utils.encode_cell({ c, r });
      const cell = sheet[cellRef];
      if (cell && cell.v) {
        const date = new Date(cell.v);
        if (!Number.isNaN(date.getTime())) {
          cell.v = date;
          cell.t = 'd';
          cell.z = 'yyyy-mm-dd hh:mm:ss';
        }
      }
    });
  }

  const book = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(book, sheet, 'Users');
  xlsx.writeFile(book, OUTPUT_FILENAME, { cellStyles: true });

  console.log(`Exported ${rows.length} users to ${OUTPUT_FILENAME}.`);

  if (updateDbPassword) {
    console.log('Updating database user passwords to "iset123" (hashed by model pre-save).');
    for (const user of users) {
      await User.findByIdAndUpdate(user._id, { password: 'iset123' }, { new: true, runValidators: true });
    }
    console.log('Database user passwords updated to iset123.');
  }

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

// Run with `node exportUsersToExcel.js` or with `node exportUsersToExcel.js update` to update the DB too
const shouldUpdate = process.argv.includes('update');
exportUsers({ updateDbPassword: shouldUpdate }).catch((error) => {
  console.error('Error exporting users:', error);
  process.exit(1);
});
