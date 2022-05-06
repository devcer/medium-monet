import {
  collection,
  Firestore,
  getDocs,
  query,
  where,
} from 'firebase/firestore/lite';

export const doesUserExist = async (
  db: Firestore,
  username = '',
): Promise<unknown> => {
  const pointersRef = collection(db, 'pointers');
  const pointerQuery = query(pointersRef, where('username', '==', username));
  const querySnapshot = await getDocs(pointerQuery);
  let userObject = null;
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
    if (doc.data().username === username) {
      userObject = doc.data();
    }
  });
  return userObject;
};
