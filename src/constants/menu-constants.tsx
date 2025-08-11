import { BotIcon, FileEdit, HelpCircle, HomeIcon, Newspaper, QuoteIcon, ReceiptCent, ReceiptIcon, ShieldCheck, User, Users2, VideoIcon } from "lucide-react";


export const userLinks = [
  { label: "Dashboard", href: "/user", icon: <HomeIcon /> },
  { label: "Meetings", href: "/user/meetings", icon: <VideoIcon /> },
  { label: "Scheduled Meetings", href: "/user/schedule-meetings", icon: <VideoIcon /> },
  { label: "Agents", href: "/user/agents", icon: <BotIcon /> },
  { label: "Billing", href: "/user/billing", icon: <ReceiptIcon /> },
  { label: "Profile", href: "/user/profile", icon: <User /> },
];

export const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: <HomeIcon /> },
  { label: "Users", href: "/admin/users", icon: <Users2 /> },
  { label: "Plans", href: "/admin/plans", icon: <ReceiptCent /> },
  { label: "Blogs", href: "/admin/blogs", icon: <FileEdit /> },
  { label: "Testimonials", href: "/admin/testimonials", icon: <QuoteIcon /> },
  { label: "Policies", href: "/admin/policies", icon: <ShieldCheck /> },
  { label: "Newsletters", href: "/admin/newsletters", icon: <Newspaper /> },
  { label: "Inquiries", href: "/admin/inquiries", icon: <HelpCircle /> },
  { label: "Profile", href: "/admin/profile", icon: <User /> },

];