import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const banks = [
    { code: 'MELI', name: 'بانک ملی ایران', nameEn: 'Bank Melli Iran' },
    { code: 'MELLAT', name: 'بانک ملت', nameEn: 'Bank Mellat' },
    { code: 'SADERAT', name: 'بانک صادرات ایران', nameEn: 'Bank Saderat Iran' },
    { code: 'TEJARAT', name: 'بانک تجارت', nameEn: 'Bank Tejarat' },
    { code: 'PASARGAD', name: 'بانک پاسارگاد', nameEn: 'Bank Pasargad' },
    { code: 'SINA', name: 'بانک سینا', nameEn: 'Bank Sina' },
    { code: 'MELLI_CREDIT', name: 'بانک ملی کارت', nameEn: 'Bank Melli Credit' },
  ];

  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: { name: bank.name, nameEn: bank.nameEn },
      create: bank,
    });
  }

  console.log('Foundation banks seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
