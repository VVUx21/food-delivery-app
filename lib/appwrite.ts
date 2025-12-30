import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
  categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
  menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID!,
  customizationCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATION_COLLECTION_ID!,
  menucustomizationCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATION_COLLECTION_ID!,
};

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if(!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        // If there's a search query, filter results on the client side
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            const filteredDocuments = menus.documents.filter((item: any) => 
                item.name?.toLowerCase().includes(searchTerm) ||
                item.description?.toLowerCase().includes(searchTerm)
            );
            return filteredDocuments;
        }

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getMenuItemById = async (id: string) => {
    try {
        const menuItem = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            id
        );

        return menuItem;
    } catch (e) {
        console.log('getMenuItemById error:', e);
        throw new Error(e as string);
    }
}

export const getMenuItemCustomizations = async (menuId: string) => {
    try {
        // Get menu-customization relationships
        const menuCustomizations = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menucustomizationCollectionId,
            [Query.equal('menu', menuId)]
        );

        if (menuCustomizations.documents.length === 0) {
            return [];
        }

        // Get all customization IDs
        const customizationIds = menuCustomizations.documents.map(
            (doc: any) => doc.customization
        );

        // Fetch all customizations
        const customizations = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationCollectionId,
            [Query.equal('$id', customizationIds)]
        );

        return customizations.documents;
    } catch (e) {
        console.log('getMenuItemCustomizations error:', e);
        throw new Error(e as string);
    }
}

export const getSimilarMenuItems = async (categoryId: string, currentItemId: string, limit: number = 6) => {
    try {
        const queries = [Query.equal('categories', categoryId)];
        
        const menuItems = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );

        // Filter out current item and limit results
        const similarItems = menuItems.documents
            .filter((item: any) => item.$id !== currentItemId)
            .slice(0, limit);

        return similarItems;
    } catch (e) {
        console.log('getSimilarMenuItems error:', e);
        throw new Error(e as string);
    }
}

