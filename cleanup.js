const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log("Fetching raw broadcasts...");
  const broadcastsObj = await prisma.$runCommandRaw({
    find: "Broadcast",
    filter: {}
  });
  
  const templatesObj = await prisma.$runCommandRaw({
    find: "BroadcastTemplate",
    filter: {}
  });
  
  const broadcasts = broadcastsObj.cursor.firstBatch;
  const templates = templatesObj.cursor.firstBatch;
  
  const templateIds = new Set(templates.map(t => t._id.$oid));
  
  let deletedCount = 0;
  for (const b of broadcasts) {
    if (!templateIds.has(b.templateId.$oid)) {
      console.log(`Deleting broadcast ${b._id.$oid} because its template is missing.`);
      await prisma.$runCommandRaw({
        delete: "Broadcast",
        deletes: [{ q: { _id: b._id }, limit: 1 }]
      });
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} invalid broadcasts.`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
