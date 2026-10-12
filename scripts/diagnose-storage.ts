import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

async function diagnose() {
  console.log('--- DIAGNOSING FIREBASE STORAGE ---');
  console.log('Firebase config:', {
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
  });

  const app = initializeApp(firebaseConfig);
  const storageDefault = getStorage(app);
  console.log('Storage default bucket:', storageDefault.app.options.storageBucket);

  // Also check with appspot.com
  const appspotBucket = `${firebaseConfig.projectId}.appspot.com`;
  console.log('Alternative appspot bucket:', appspotBucket);

  const testBuffer = Buffer.from('Hello OutFyt diagnostic test ' + Date.now());
  const testRef = ref(storageDefault, `test/diagnostic_${Date.now()}.txt`);

  console.log('\nTesting uploadBytes on default storage...');
  try {
    const snap = await uploadBytes(testRef, testBuffer, { contentType: 'text/plain' });
    console.log('uploadBytes succeeded! Ref:', snap.ref.fullPath);
    const url = await getDownloadURL(snap.ref);
    console.log('getDownloadURL succeeded:', url);
  } catch (err: any) {
    console.error('uploadBytes failed with code:', err.code);
    console.error('Message:', err.message);
    console.error('Full error:', err);
  }

  console.log('\nTesting uploadBytesResumable on default storage...');
  try {
    const resumableRef = ref(storageDefault, `test/resumable_${Date.now()}.txt`);
    const task = uploadBytesResumable(resumableRef, testBuffer, { contentType: 'text/plain' });

    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snapshot) => {
          console.log(`Resumable progress: ${snapshot.bytesTransferred} / ${snapshot.totalBytes}`);
        },
        (error) => {
          console.error('Resumable error callback:', error.code, error.message);
          reject(error);
        },
        async () => {
          console.log('Resumable completed!');
          const url = await getDownloadURL(task.snapshot.ref);
          console.log('Resumable download URL:', url);
          resolve(url);
        }
      );
    });
  } catch (err: any) {
    console.error('Resumable task rejected with:', err.code, err.message);
  }
}

diagnose().then(() => {
  console.log('\nDiagnosis complete.');
  process.exit(0);
}).catch((e) => {
  console.error('\nFatal diagnosis error:', e);
  process.exit(1);
});
