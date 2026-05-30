import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const orderNumber = 'cmpp2ik72000scepwifmh3crr';
  
  // Try to find by orderNumber
  let order = await prisma.order.findUnique({ where: { orderNumber } });
  
  if (!order) {
    console.log(`Order not found by orderNumber: ${orderNumber}`);
    // Try to find by id
    order = await prisma.order.findUnique({ where: { id: orderNumber } });
    if (order) {
      console.log(`Order found by ID! The actual orderNumber is: ${order.orderNumber}`);
    } else {
      console.log('Order not found by ID either.');
      
      // Let's just list the most recent order to see what we have
      const recent = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      console.log('Recent orders:');
      recent.forEach(o => console.log(`ID: ${o.id}, OrderNumber: ${o.orderNumber}, Status: ${o.status}, Total: ${o.total}`));
    }
  } else {
    console.log('Order found by orderNumber!');
    console.log(`Status: ${order.status}, Total: ${order.total}`);
    
    // Check what the webhook would do
    const expectedAmount = order.total * 26000;
    console.log(`Expected Amount (VND): ${expectedAmount}`);
    console.log(`Difference from 383500: ${383500 - expectedAmount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
