import { useEffect, useState } from "react";
import { Container, Text, Title, Alert, Tabs, Button, TextInput, Card, Group, Modal } from "@mantine/core";
import { useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconUserFilled, IconShieldLockFilled, IconLockX } from '@tabler/icons-react';
import { UPDATE_PASSWORD } from "@/graphql/mutations/UpdatePassword";
import { UPDATE_NAME } from "@/graphql/mutations/UpdateName";
import { UPDATE_PHONE } from "@/graphql/mutations/UpdatePhone";
import { UPDATE_EMAIL } from "@/graphql/mutations/UpdateEmail";
import { DELETE_USER } from "@/graphql/mutations/DeleteUser";
import GET_USER_BY_UUID from "@/graphql/queries/GetUserByUUID";

export function ProfileSetting() {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    uuid: "",
  });

  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [editName, setEditName] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  // Add state for the delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast.success("Account deleted successfully.");
      localStorage.removeItem("user"); // Remove user data from localStorage
      navigate("/signup"); // Navigate to the signup page after account deletion
    },
    onError: (err) => {
      setDeleteErrorMessage(err.message);
    },
  });

  // Fetch user data using the uuid
  const { data: userData, refetch: refetchUser } = useQuery(GET_USER_BY_UUID, {
    variables: { uuid: userInfo.uuid },
    skip: !userInfo.uuid, // Skip if userInfo.uuid is empty
  });

  
  // Fetch user data from localStorage and set it to the userInfo state
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUserInfo(parsedUser);
      
      // Set the initial values for the fields when the user info is available
      setNewName(parsedUser.name);
      setNewPhone(parsedUser.phone);
      setNewEmail(parsedUser.email);
    }
  }, []);
  
  
  const [updatePassword] = useMutation(UPDATE_PASSWORD, {
    onCompleted: () => {
      setPasswordLoading(false);
      setErrorMessage("");
      navigate(`/my-tournaments`);
      refetchUser(); // Refetch user data after successful password change
    },
    onError: (err) => {
      setPasswordLoading(false);
      setErrorMessage(err.message);
    },
  });

  const [updateName] = useMutation(UPDATE_NAME, {
    onCompleted: () => {
      setEditName(false);
      const updatedUser = { ...userInfo, name: newName };
      setUserInfo(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      refetchUser(); // Refetch user data after successful name change
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [updatePhone] = useMutation(UPDATE_PHONE, {
    onCompleted: () => {
      setEditPhone(false);
      const updatedUser = { ...userInfo, phone: newPhone };
      setUserInfo(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      refetchUser(); // Refetch user data after successful phone change
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const [updateEmail] = useMutation(UPDATE_EMAIL, {
    onCompleted: () => {
      setEditEmail(false);
      const updatedUser = { ...userInfo, email: newEmail };
      setUserInfo(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      refetchUser(); // Refetch user data after successful email change
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Handle account deletion - updated to open the modal
  const openDeleteModal = () => {
    if (!confirmPassword) {
      toast.error("Please confirm your password.");
      return;
    }
    
    setDeleteModalOpen(true);
  };
  
  // Actual delete function executed after confirmation
  const confirmDeleteAccount = async () => {
    setDeleteErrorMessage("");

    try {
      await deleteUser({
        variables: {
          uuid: userInfo.uuid,
          password: confirmPassword,
        },
      });
      // Success handling already in the onCompleted callback
    } catch (error) {
      toast.error("There was an error deleting your account.");
      console.error("Delete account error:", error);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (oldPassword === newPassword) {
      toast.error("New password can't be the Current password.");
      return;
    }
  
    if (!oldPassword || !newPassword || !newPasswordConfirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
  
    if (newPassword !== newPasswordConfirm) {
      toast.error("Confirmation does not match new password.");
      return;
    }
  
    setPasswordLoading(true);
  
    try {
      const { data } = await updatePassword({
        variables: {
          uuid: userInfo.uuid,
          oldPassword,
          newPassword,
        },
      });
  
      if (!data.updatePassword.success) {
        toast.error("The old password is incorrect.");
        setPasswordLoading(false);
        return;
      }
  
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      toast.success("Password updated successfully!");
    } catch (error) {
      setPasswordLoading(false);
    }
  };
  

  // Handle cancel for name change
  const handleCancelNameChange = () => {
    setEditName(false);
    setNewName(userInfo.name); // Reset to the original value
  };

  // Handle cancel for phone change
  const handleCancelPhoneChange = () => {
    setEditPhone(false);
    setNewPhone(userInfo.phone); // Reset to the original value
  };

  // Handle cancel for email change
  const handleCancelEmailChange = () => {
    setEditEmail(false);
    setNewEmail(userInfo.email); // Reset to the original value
  };

  // Handle Name change
  const handleNameChange = async () => {
    if (!newName) {
      toast.error("Name can't be blank.");
      return;
    }
  
    if (newName === userInfo.name) {
      toast.error("New name cannot be the same as the old one.");
      return;
    }
  
    try {
      await updateName({
        variables: {
          uuid: userInfo.uuid,
          newName,
        },
      });
  
      // Update local storage with the new name
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user) {
        user.name = newName;
        localStorage.setItem("user", JSON.stringify(user));
      }
  
      toast.success("Name updated successfully!");
  
      // TODO: bug where change name in profile doesnt show change on logged in pages. Currently hard refreshing the page.
      navigate("/my-tournaments");
      
    } catch (error) {
      toast.error("There was an error updating your name.");
    }
  };
  
  // Handle Phone change
  const handlePhoneChange = async () => {
    // Make newPhone mutable by using `let`
    let phoneToUpdate = newPhone;

    // If phone is empty, set it to "None"
    if (!phoneToUpdate) {
      phoneToUpdate = "None";
    }

    if (phoneToUpdate === userInfo.phone) {
      toast.error("New phone number cannot be the same as the old one.");
      return;
    }

    // Check if the phone number has exactly 10 digits (if it's not "None")
    if (phoneToUpdate !== "None" && !/^\d{10}$/.test(phoneToUpdate)) {
      toast.error("Phone number must contain exactly 10 digits.");
      return;
    }

    try {
      await updatePhone({
        variables: {
          uuid: userInfo.uuid,
          newPhone: phoneToUpdate, // Pass the updated phone number
        },
      });
      toast.success("Phone updated successfully!");
    } catch (error) {
      toast.error("There was an error updating your phone.");
    }
  };

  // Handle Email change
  const handleEmailChange = async () => {
    if (!newEmail) {
      toast.error("Email can't be blank.");
      return;
    }

    if (newEmail === userInfo.email) {
      toast.error("New email cannot be the same as the old one.");
      return;
    }

    // Improved email format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Email is in wrong format.");
      return;
    } 

    try {
      await updateEmail({
        variables: {
          uuid: userInfo.uuid,
          newEmail,
        },
      });
      toast.success("Email updated successfully!");
    } catch (error) {
      toast.error("There was an error updating your email.");
    }
  };

return (
  <Container
    style={{
      maxWidth: "600px",
      margin: "auto",
      textAlign: "left",
    }}
  >
    <Title
      style={{
        fontSize: "1.8rem",
        fontWeight: 700,
        paddingBottom: "1rem",
        marginTop: "5rem"
      }}
    >
      <strong>Profile Setting</strong>
    </Title>

    {userInfo.name ? (
      <>
        <Tabs defaultValue="about" color="orange">
          {/* Tab Header */}
          <Tabs.List>
            <Tabs.Tab 
              value="about"
              fz="md" 
              leftSection={<IconUserFilled size={17} />}>

                About
            </Tabs.Tab>
            <Tabs.Tab 
              value="security" 
              fz="md"
              leftSection={<IconShieldLockFilled size={17} />}>

                Password Setting
            </Tabs.Tab>

            <Tabs.Tab 
              value="deactivate" 
              fz="md"
              leftSection={<IconLockX size={17} />}>

                Account Deactivation
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Panel value="about">
          <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "white",
                color: "black",
                marginTop: "3rem",
                padding: "3rem",
              }}
            >
              <Title>About me</Title>
              {/* Name Section */}
              <div style={ {marginTop: "1rem" }}>
                {editName ? (
                  <>
                    <TextInput
                      label="New Name"
                      size="lg"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      style={{ marginBottom: "1rem", }}
                    />
                    <Group>
                      <Button
                        onClick={handleCancelNameChange}
                        variant="outline"
                        color="gray"
                        size="s"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleNameChange}
                        variant="gradient"
                        size="s"
                        gradient={{ from: "#FF7518", to: "yellow"}}
                      >
                        Save
                      </Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text size="lg">
                      <strong>Name:</strong> {userInfo.name}
                    </Text>
                    <Button
                      onClick={() => setEditName(true)}
                      variant="gradient"
                      size="s"
                      style={{ marginTop: "1rem"}}
                      gradient={{ from: "orange", to: "yellow"}}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>

              {/* Email Section */}
              <div style={{ marginTop: "1rem" }}>
                {editEmail ? (
                  <>
                    <TextInput
                      label="New Email"
                      size="md"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      style={{ marginBottom: "1rem" }}
                    />
                    <Group>
                      <Button
                        onClick={handleCancelEmailChange}
                        variant="outline"
                        color="gray"
                        size="s"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEmailChange}
                        variant="gradient"
                        size="s"
                        gradient={{ from: "#FF7518", to: "yellow"}}
                      >
                        Save
                      </Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text size="lg">
                      <strong>Email:</strong> {userInfo.email}
                    </Text>
                    <Button
                      onClick={() => setEditEmail(true)}
                      variant="gradient"
                      size="s"
                      style={{ marginTop: "1rem"}}
                      gradient={{ from: "orange", to: "yellow"}}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>

              {/* Phone Section */}
              <div style={{ marginTop: "1rem" }}>
                {editPhone ? (
                  <>
                    <TextInput
                      label="New Phone"
                      size="md"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      style={{ marginBottom: "1rem" }}
                    />
                    <Group>
                      <Button
                        onClick={handleCancelPhoneChange}
                        variant="outline"
                        color="gray"
                        size="s"
                        style={{ marginLeft: "0.5rem" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handlePhoneChange}
                        variant="gradient"
                        size="s"
                        gradient={{ from: "#FF7518", to: "yellow"}}
                      >
                        Save
                      </Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text size="lg">
                      <strong>Phone:</strong> {userInfo.phone || "None"}
                    </Text>
                    <Button
                      onClick={() => setEditPhone(true)}
                      variant="gradient"
                      size="s"
                      style={{ marginTop: "1rem", marginBottom: "1rem" }}
                      gradient={{ from: "orange", to: "yellow"}}
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </Tabs.Panel>

          {/* Account Security Tab */}
          <Tabs.Panel value="security">
            <Card
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                backgroundColor: "white",
                color: "black",
                marginTop: "3rem",
                padding: "3rem",
              }}
            >
              <Title>Change Password</Title>
              {errorMessage && (
                <Alert color="red" style={{ marginBottom: "1rem" }}>
                  {errorMessage}
                </Alert>
              )}
                  <TextInput
                    label="Current Password"
                    size="md"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ marginBottom: "1rem", marginTop: "1rem" }}
                  />
                  <TextInput
                    label="New Password"
                    size="md"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ marginBottom: "1rem" }}
                  />
                  <TextInput
                    label="Confirm New Password"
                    size="md"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    style={{ marginBottom: "1rem" }}
                  />
                  <Button
                    onClick={handlePasswordChange}
                    loading={passwordLoading}
                    disabled={newPassword === ""}
                    variant="gradient"
                    size="md"
                    style={{ marginTop: "1rem" }}
                    gradient={{ from: "orange", to: "yellow"}}
                  >
                    Submit
                  </Button>
            </Card>
            </Tabs.Panel>
          {/* Account Deactivation Tab */}
            <Tabs.Panel value="deactivate">
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  backgroundColor: "white",
                  color: "black",
                  marginTop: "3rem",
                  padding: "3rem",
                }}
              >
                <Title>Deactivate Account</Title>
                {deleteErrorMessage && (
                  <Alert color="red" style={{ marginBottom: "1rem" }}>
                    {deleteErrorMessage}
                  </Alert>
                )}
                <TextInput
                  label="Current Password"
                  size="md"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{ marginBottom: "1rem", marginTop:"1rem" }}
                />
                <TextInput
                  label="Confirm Password"
                  size="md"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ marginBottom: "1rem", marginTop:"1rem" }}
                />
                <Button
                  onClick={openDeleteModal}
                  variant="filled"
                  color="red"
                  size="s"
                >
                  Delete Account
                </Button>
              </Card>
            </Tabs.Panel>
        </Tabs>

        {/* Delete Account Confirmation Modal */}
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Account Deletion"
          centered
          size="md"
        >
          <Text size="md" style={{ marginBottom: "1.5rem" }}>
            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
          </Text>
          <Group>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              variant="outline"
              color="gray"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAccount}
              variant="filled"
              color="red"
            >
              Yes, Delete My Account
            </Button>
          </Group>
        </Modal>
      </>
    ) : (
      <Text color="orange">No user info found</Text>
    )}
  </Container>
);
}