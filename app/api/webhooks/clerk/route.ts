import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";
import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } =
      evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      avatar: image_url,
    };

    const newUser = await createUser(user);

    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: "OK", user: newUser });
  }

  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      avatar: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  return new Response("", { status: 200 });
}



// import { clerkClient } from "@clerk/nextjs/server";
// import { createUser } from "@/lib/actions/user.actions";

// export async function POST(req: Request) {
//   try {
//     const { userId } = await req.json();

//     // Fetch user details from Clerk
//     const user = await clerkClient.users.getUser(userId);

//     if (!user) {
//       return new Response("User not found", { status: 404 });
//     }

//     // Prepare user data for your database
//     const userData = {
//       clerkId: user.id,
//       email: user.emailAddresses[0]?.emailAddress || null,
//       username: user.username || null,
//       firstName: user.firstName || null,
//       lastName: user.lastName || null,
//       // avatar: user.profileImageUrl || null,
//     };

//     // Store the user in your database
//     const newUser = await createUser(userData);

//     return new Response(JSON.stringify({ message: "User stored", user: newUser }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" },
//     });
//   } catch (error) {
//     console.error("Error storing user:", error);
//     return new Response("Internal Server Error", { status: 500 });
//   }
// }



// import { headers } from "next/headers";
// import { clerkClient } from "@clerk/nextjs/server";
// import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   // Get the body
//   const payload = await req.json();
//   const { type, data } = payload;

//   // Handle different event types
//   if (type === "user.created") {
//     const { id, email_addresses, image_url, first_name, last_name, username } = data;

//     const user = {
//       clerkId: id,
//       email: email_addresses[0].email_address,
//       username: username!,
//       firstName: first_name,
//       lastName: last_name,
//       avatar: image_url,
//     };

//     const newUser = await createUser(user);

//     if (newUser) {
//       await clerkClient.users.updateUserMetadata(id, {
//         publicMetadata: {
//           userId: newUser._id,
//         },
//       });
//     }

//     return NextResponse.json({ message: "OK", user: newUser });
//   }

//   if (type === "user.updated") {
//     const { id, image_url, first_name, last_name, username } = data;

//     const user = {
//       firstName: first_name,
//       lastName: last_name,
//       username: username!,
//       avatar: image_url,
//     };

//     const updatedUser = await updateUser(id, user);

//     return NextResponse.json({ message: "OK", user: updatedUser });
//   }

//   if (type === "user.deleted") {
//     const { id } = data;

//     const deletedUser = await deleteUser(id!);

//     return NextResponse.json({ message: "OK", user: deletedUser });
//   }

//   return new Response("", { status: 200 });
// }