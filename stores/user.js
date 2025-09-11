
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import nuxtStorage from 'nuxt-storage';
import md5 from 'js-md5';

export const useUserStore = defineStore('userStore', {
    state: () => ({
        user: null,
        authenticated: null,
        notification: null
    }),
    actions: {
        setNotification (notification) {
            this.notification = notification
            setTimeout(() => {
                this.notification = null
            }, notification.delay || 3000)
        },
        async login(email, password) {
            const nuxtApp = useNuxtApp()
            const db = getFirestore(nuxtApp.$firebase);
    
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email), where("password", "==", md5(password)));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userData = querySnapshot.docs[0].data();
                this.user = userData;
                this.authenticated = true;
                nuxtStorage.localStorage.setData('user', this.user);
                nuxtStorage.localStorage.setData('authenticated', true);
                this.setNotification({
                    text: `Welcome back, ${this.user.name}!`,
                    color: 'success',
                    delay: 5000
                })
                return userData;
            } else {
                this.user = null
                this.authenticated = false;
                nuxtStorage.localStorage.setData('user', null);
                nuxtStorage.localStorage.setData('authenticated', false);
                this.setNotification({
                    text: 'Error logging in, please check your credentials and try again.',
                    color: 'warning',
                    delay: 3000
                })
                return null;
            }
        },
        logout () {
            this.user = null;
            this.authenticated = false;
            nuxtStorage.localStorage.setData('user', null);
            nuxtStorage.localStorage.setData('authenticated', false);
            this.setNotification({
                text: 'Successfully logged out!',
                color: 'warning',
                delay: 3000
            })
        }
    }
})