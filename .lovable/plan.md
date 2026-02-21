

## แก้ปัญหา Foreign Key: บันทึกอาการ/วินิจฉัยไม่ได้

### สาเหตุ
คอลัมน์ `created_by` ในตาราง `patient_consultations`, `patient_diagnoses` และ `patient_treatment_plans` มี foreign key อ้างอิงไปยัง `profiles(id)` แต่ตาราง `profiles` ว่างเปล่า ไม่มีข้อมูลของผู้ใช้คนใด รวมถึง doctor ที่ login อยู่

### สิ่งที่จะทำ

#### 1. เพิ่มข้อมูล profile ให้ผู้ใช้ทุกคนที่มีอยู่แล้ว
- INSERT profile สำหรับ doctor (`d0162e28-19ba-4358-87ec-f82a9a405368`)
- INSERT profile สำหรับ patient (`ba1cc1f3-386f-4494-85af-6c036f995e72`)

#### 2. สร้าง trigger อัตโนมัติ
- สร้าง trigger `on_auth_user_created_profile` บน `auth.users` เรียก `handle_new_user()` เพื่อให้ผู้ใช้ใหม่ในอนาคตมี profile อัตโนมัติ

#### 3. เพิ่ม INSERT policy บนตาราง profiles
- ตอนนี้ตาราง `profiles` ไม่มี INSERT policy ทำให้ trigger ที่เป็น security definer ต้องรับผิดชอบการ insert เอง ซึ่งถูกต้องแล้ว แต่ต้องตรวจสอบว่า trigger ทำงานได้

### หมายเหตุ
- ไม่ต้องแก้ไขโค้ดฝั่ง frontend
- หลังแก้ไขแล้ว ระบบบันทึกอาการ วินิจฉัย และแผนการรักษาจะใช้งานได้ทันที

### รายละเอียดทางเทคนิค

**ขั้นตอน 1 - Data fix (insert tool):**
```sql
INSERT INTO profiles (id, email, full_name) VALUES
('d0162e28-19ba-4358-87ec-f82a9a405368', 'doctor@gmail.com', 'john doctor'),
('ba1cc1f3-386f-4494-85af-6c036f995e72', 'patient@gmail.com', 'john patient')
ON CONFLICT (id) DO NOTHING;
```

**ขั้นตอน 2 - Migration (trigger):**
```sql
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```
