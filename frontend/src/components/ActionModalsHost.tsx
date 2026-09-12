import { useState } from "react";
import { ReservationFormModal } from "./ReservationFormModal";
import { StudentFormModal } from "./StudentFormModal";
import { UserFormModal } from "./UserFormModal";
import { UserCredentialsModal } from "./UserCredentialsModal";
import {
    useActionModalActions,
    useActiveActionModal,
    useReservationModalData,
    useStudentModalData,
    useUserModalData,
} from "@/stores/useActionModalStore";
import { useReservationsActions } from "@/stores/useReservationsStore";
import { useStudentsActions } from "@/stores/useStudentsStore";
import { useUsersActions, type NewUserAccount } from "@/stores/useUsersStore";
import { useAuth } from "@/utils/AuthProvider";

type CreatedCredentials = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

export function ActionModalsHost() {
    const activeModal = useActiveActionModal();
    const reservation = useReservationModalData();
    const student = useStudentModalData();
    const user = useUserModalData();
    const { close } = useActionModalActions();

    const { UserData } = useAuth();
    const currentUserId = UserData?.user?.userInfo?.id;
    const isAdmin = UserData?.user?.userInfo?.role === "admin";

    const { createReservation, createRecurringReservation, patchReservation } = useReservationsActions();
    const { createStudents, patchStudent } = useStudentsActions();
    const { createUser, patchUser } = useUsersActions();

    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [credentials, setCredentials] = useState<CreatedCredentials | null>(null);

    const handleCreateUser = async (data: NewUserAccount) => {
        const password = await createUser(data);
        if (password) {
            setCredentials({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password,
            });
            setCredentialsOpen(true);
        }
        return password;
    };

    const handleClose = (open: boolean) => {
        if (!open) close();
    };

    return (
        <>
            <ReservationFormModal
                open={activeModal === "reservation"}
                onOpenChange={handleClose}
                reservation={reservation}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onCreate={createReservation}
                onCreateRecurring={createRecurringReservation}
                onUpdate={patchReservation}
            />

            <StudentFormModal
                open={activeModal === "student"}
                onOpenChange={handleClose}
                student={student}
                onSubmitBatch={createStudents}
                onSubmitEdit={patchStudent}
            />

            <UserFormModal
                open={activeModal === "user"}
                onOpenChange={handleClose}
                user={user}
                onCreate={handleCreateUser}
                onUpdate={patchUser}
            />

            <UserCredentialsModal
                open={credentialsOpen}
                onOpenChange={setCredentialsOpen}
                credentials={credentials}
            />
        </>
    );
}
