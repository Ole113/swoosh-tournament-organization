import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { HeaderMenu } from "./Header";

// Storybook Metadata
export default {
  title: "Components/HeaderMenu",
  component: HeaderMenu,
} as Meta;

// Dropdown links for the user
const userDropdownLinks = [
  { link: "/settings", label: "Settings" },
  { link: "/logout", label: "Logout" },
];

// Links for a user who is not logged in
const linksNotLoggedIn = [
  { link: "/join", label: "Join Tournament" },
  { link: "/signup", label: "Sign Up" },
  { link: "/login", label: "Log In" },
];

// Links for a signed-in user (with dynamic user label)
const linksLoggedInUser = [
  { link: "/join", label: "Join Tournament" },
  { link: "/my-tournaments", label: "My Tournaments" },
  {
    link: "#user",
    label: "Kaden (User)",
    links: userDropdownLinks,
  },
];

// Links for a signed-in admin (with dynamic admin label)
const linksLoggedInAdmin = [
  { link: "/create", label: "Create Tournament" },
  { link: "/my-tournaments", label: "My Tournaments" },
  {
    link: "#user",
    label: "Kaden (Admin)",
    links: userDropdownLinks,
  },
];

// A function to simulate logout for Storybook purposes (in a real app, this would navigate to the login page)
const handleLogout = () => {
  alert("Logging out... (This is a Storybook simulation!)");
};

// Template to render the HeaderMenu component with passed args
const Template: StoryFn<typeof HeaderMenu> = (args) => {
  // Modify links to handle logout behavior in Storybook
  const updatedLinks = args.links.map((link) => {
    if (link.label === "Logout") {
      return {
        ...link,
        // Override the 'Logout' link to trigger the handleLogout function in Storybook
        links: link.links?.map((dropdownLink) => ({
          ...dropdownLink,
          label: dropdownLink.label === "Logout" ? "Logout" : dropdownLink.label,
          onClick: dropdownLink.label === "Logout" ? handleLogout : undefined,
        })),
      };
    }
    return link;
  });

  return <HeaderMenu {...args} links={updatedLinks} />;
};

// Stories for different user states
export const NotLoggedIn = Template.bind({});
NotLoggedIn.args = {
  links: linksNotLoggedIn,
};

export const LoggedInUser = Template.bind({});
LoggedInUser.args = {
  links: linksLoggedInUser,
};

export const LoggedInAdmin = Template.bind({});
LoggedInAdmin.args = {
  links: linksLoggedInAdmin,
};
