import { signOut } from "@/lib/auth";
import { User } from "@/types/user"

export const authService = {
    signIn: (email: string, _password: string) => {
        const user : User = {
            id: '1',
            name: 'John Doe',
            email
        }
        return user;
    },   
    signOut: () => {
        signOut({ redirectTo: '/' });
    },
    signUp: (name: string, email: string, _password: string) => {
        const user : User = {
            id: '2',
            name,
            email
        }
        return user;
    }
}