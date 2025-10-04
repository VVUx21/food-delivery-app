import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";
import * as FileSystem from 'expo-file-system';

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customization: string[];
}

interface DummyData {
  categories: Category[];
  customization: Customization[];
  menu: MenuItem[];
}

const data = dummyData as DummyData;

// ---------- Helpers ----------
async function clearAll(collectionId: string): Promise<void> {
  console.log(`🧹 Clearing collection: ${collectionId}`);
  try {
    const list = await databases.listDocuments(appwriteConfig.databaseId, collectionId);

    await Promise.all(
      list.documents.map((doc) =>
        databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
      )
    );
    console.log(`✅ Cleared ${list.documents.length} documents from ${collectionId}`);
  } catch (err) {
    console.error(`❌ Failed clearing ${collectionId}`, err);
  }
}

async function clearStorage(): Promise<void> {
  console.log("🧹 Clearing storage bucket...");
  try {
    const list = await storage.listFiles(appwriteConfig.bucketId);
    await Promise.all(
      list.files.map((file) =>
        storage.deleteFile(appwriteConfig.bucketId, file.$id)
      )
    );
    console.log(`✅ Cleared ${list.files.length} files from storage`);
  } catch (err) {
    console.error("❌ Failed clearing storage", err);
  }
}

const { Paths,File } = FileSystem;
export async function uploadImageToStorage(imageUrl: string) {
  try {
    console.log("📤 Uploading image:", imageUrl);

    // 1. Extract filename
    const filename = `${imageUrl.split("/").pop()?.split(".")[0]}-${Date.now()}.png`;

    // 2. Create a File instance in cache directory
    const file = new File(Paths.cache, filename);

    if ((file.info()).exists) {
      file.delete();
      console.log("🗑️ Deleted existing cached file");
    }

    // 3. Download remote image into that File
    await File.downloadFileAsync(imageUrl, file);
    console.log("📥 Image downloaded to:", file.uri);

    // 4. Get file info
    const info = file.info();
    if (!info.exists || !info.uri) {
      throw new Error("❌ File download failed");
    }

    // 5. Build the file object Appwrite expects
    const fileObject = {
      uri: info.uri,
      name: filename,
      type: filename.endsWith(".png")
        ? "image/png"
        : filename.endsWith(".jpg") || filename.endsWith(".jpeg")
        ? "image/jpeg"
        : "application/octet-stream",
      size: info.size ?? 0, // fallback
    };

    // 6. Upload to Appwrite bucket
    const uploadedFile = await storage.createFile({
      bucketId: appwriteConfig.bucketId,
      fileId: ID.unique(),
      file: fileObject,
    });

    // 7. Get public file URL
    const url = storage.getFileViewURL(appwriteConfig.bucketId, uploadedFile.$id);
    console.log(`✅ Uploaded image -> ${url}`);

    return url;
  } catch (err) {
    console.error("❌ Failed uploading image:", imageUrl, err);
    throw err;
  }
}

// ---------- Main Seeder ----------
async function seed(): Promise<void> {
  console.log("🚀 Starting seeding process...");

  // 1. Clear all
  await clearAll(appwriteConfig.categoriesCollectionId);
  await clearAll(appwriteConfig.customizationCollectionId);
  await clearAll(appwriteConfig.menuCollectionId);
  await clearAll(appwriteConfig.menucustomizationCollectionId);
  await clearStorage();

  // 2. Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of data.categories) {
    try {
      console.log(`📌 Creating category: ${cat.name}`);
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        cat
      );
      categoryMap[cat.name] = doc.$id;
      console.log(`✅ Category created: ${cat.name} -> ${doc.$id}`);
    } catch (err) {
      console.error(`❌ Failed creating category: ${cat.name}`, err);
    }
  }

  // 3. Customizations
  const customizationMap: Record<string, string> = {};
  for (const cus of data.customization) {
    try {
      console.log(`📌 Creating customization: ${cus.name}`);
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.customizationCollectionId,
        ID.unique(),
        cus
      );
      customizationMap[cus.name] = doc.$id;
      console.log(`✅ Customization created: ${cus.name} -> ${doc.$id}`);
    } catch (err) {
      console.error(`❌ Failed creating customization: ${cus.name}`, err);
    }
  }

  // 4. Menu Items
  for (const item of data.menu) {
    try {
      console.log(`📌 Creating menu item: ${item.name}`);

      const uploadedImage = await uploadImageToStorage(item.image_url);

      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        ID.unique(),
        {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        }
      );

      console.log(`✅ Menu item created: ${item.name} -> ${doc.$id}`);

      // 5. Menu Customizations
      for (const cusName of item.customization) {
        try {
          console.log(`↳ Linking customization: ${cusName} to ${item.name}`);
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menucustomizationCollectionId,
            ID.unique(),
            {
              menu: doc.$id,
              customization: customizationMap[cusName],
            }
          );
          console.log(`✅ Linked customization ${cusName}`);
        } catch (err) {
          console.error(`❌ Failed linking customization ${cusName}`, err);
        }
      }
    } catch (err) {
      console.error(`❌ Failed creating menu item: ${item.name}`, err);
    }
  }

  console.log("🎉 Seeding complete!");
}

export default seed;
