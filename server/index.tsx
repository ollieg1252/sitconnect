import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Helper function to verify user authentication
async function getAuthenticatedUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Health check endpoint
app.get("/make-server-539c048d/health", (c) => {
  return c.json({ status: "ok" });
});

// User registration
app.post("/make-server-539c048d/auth/signup", async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();
    
    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    if (!['parent', 'student'].includes(userType)) {
      return c.json({ error: "Invalid user type" }, 400);
    }
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (authError) {
      console.log(`Auth error during signup: ${authError.message}`);
      return c.json({ error: authError.message }, 400);
    }
    
    // Store user profile in KV store
    const profileKey = `profile:${authData.user.id}`;
    const profile = {
      id: authData.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString()
    };
    
    await kv.set(profileKey, JSON.stringify(profile));
    
    return c.json({ 
      message: "User created successfully", 
      user: { 
        id: authData.user.id, 
        email, 
        name, 
        userType 
      } 
    });
    
  } catch (error) {
    console.log(`Server error during signup: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get user profile
app.get("/make-server-539c048d/auth/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const profileKey = `profile:${user.id}`;
    const profileData = await kv.get(profileKey);
    
    if (!profileData) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    const profile = JSON.parse(profileData);
    return c.json({ profile });
    
  } catch (error) {
    console.log(`Server error getting profile: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update user profile
app.put("/make-server-539c048d/auth/profile", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const updates = await c.req.json();
    const profileKey = `profile:${user.id}`;
    const existingProfileData = await kv.get(profileKey);
    
    if (!existingProfileData) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    const existingProfile = JSON.parse(existingProfileData);
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(profileKey, JSON.stringify(updatedProfile));
    
    return c.json({ 
      message: "Profile updated successfully", 
      profile: updatedProfile 
    });
    
  } catch (error) {
    console.log(`Server error updating profile: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create a babysitting notice
app.post("/make-server-539c048d/notices", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    // Verify user is a parent
    const profileKey = `profile:${user.id}`;
    const profileData = await kv.get(profileKey);
    if (!profileData) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    const profile = JSON.parse(profileData);
    if (profile.userType !== 'parent') {
      return c.json({ error: "Only parents can create notices" }, 403);
    }
    
    const { title, description, date, time, address, location, payRate, duration, ageGroup } = await c.req.json();
    
    if (!title || !description || !date || !time || !address || !location || !payRate || !duration || !ageGroup) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const noticeId = crypto.randomUUID();
    const notice = {
      id: noticeId,
      parentId: user.id,
      parentName: profile.name,
      title,
      description,
      date,
      time,
      address,
      location,
      payRate,
      duration,
      ageGroup,
      status: 'open',
      createdAt: new Date().toISOString(),
      applications: []
    };
    
    const noticeKey = `notice:${noticeId}`;
    await kv.set(noticeKey, JSON.stringify(notice));
    
    return c.json({ 
      message: "Notice created successfully", 
      notice 
    });
    
  } catch (error) {
    console.log(`Server error creating notice: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get all open notices (for students)
app.get("/make-server-539c048d/notices", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const noticeKeys = await kv.getByPrefix('notice:');
    const notices = noticeKeys
      .map(key => JSON.parse(key))
      .filter(notice => notice.status === 'open')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ notices });
    
  } catch (error) {
    console.log(`Server error getting notices: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get notices created by a parent
app.get("/make-server-539c048d/notices/my-notices", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const noticeKeys = await kv.getByPrefix('notice:');
    const myNotices = noticeKeys
      .map(key => JSON.parse(key))
      .filter(notice => notice.parentId === user.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ notices: myNotices });
    
  } catch (error) {
    console.log(`Server error getting my notices: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Apply to a babysitting notice
app.post("/make-server-539c048d/notices/:noticeId/apply", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const noticeId = c.req.param('noticeId');
    const { message } = await c.req.json();
    
    // Verify user is a student
    const profileKey = `profile:${user.id}`;
    const profileData = await kv.get(profileKey);
    if (!profileData) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    const profile = JSON.parse(profileData);
    if (profile.userType !== 'student') {
      return c.json({ error: "Only students can apply to notices" }, 403);
    }
    
    // Get the notice
    const noticeKey = `notice:${noticeId}`;
    const noticeData = await kv.get(noticeKey);
    if (!noticeData) {
      return c.json({ error: "Notice not found" }, 404);
    }
    
    const notice = JSON.parse(noticeData);
    
    // Check if already applied
    const existingApplication = notice.applications.find((app: any) => app.studentId === user.id);
    if (existingApplication) {
      return c.json({ error: "Already applied to this notice" }, 400);
    }
    
    // Add application
    const application = {
      id: crypto.randomUUID(),
      studentId: user.id,
      studentName: profile.name,
      message,
      status: 'pending',
      appliedAt: new Date().toISOString()
    };
    
    notice.applications.push(application);
    await kv.set(noticeKey, JSON.stringify(notice));
    
    return c.json({ 
      message: "Application submitted successfully", 
      application 
    });
    
  } catch (error) {
    console.log(`Server error applying to notice: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get applications for a student
app.get("/make-server-539c048d/applications/my-applications", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const noticeKeys = await kv.getByPrefix('notice:');
    const applications = [];
    
    for (const noticeData of noticeKeys) {
      const notice = JSON.parse(noticeData);
      const userApplication = notice.applications.find((app: any) => app.studentId === user.id);
      if (userApplication) {
        applications.push({
          ...userApplication,
          notice: {
            id: notice.id,
            title: notice.title,
            date: notice.date,
            time: notice.time,
            location: notice.location,
            payRate: notice.payRate,
            parentName: notice.parentName
          }
        });
      }
    }
    
    applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    
    return c.json({ applications });
    
  } catch (error) {
    console.log(`Server error getting my applications: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update application status (accept/reject)
app.put("/make-server-539c048d/notices/:noticeId/applications/:applicationId", async (c) => {
  try {
    const user = await getAuthenticatedUser(c.req.raw);
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    
    const noticeId = c.req.param('noticeId');
    const applicationId = c.req.param('applicationId');
    const { status } = await c.req.json();
    
    if (!['accepted', 'rejected'].includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }
    
    // Get the notice
    const noticeKey = `notice:${noticeId}`;
    const noticeData = await kv.get(noticeKey);
    if (!noticeData) {
      return c.json({ error: "Notice not found" }, 404);
    }
    
    const notice = JSON.parse(noticeData);
    
    // Verify user owns this notice
    if (notice.parentId !== user.id) {
      return c.json({ error: "Unauthorized" }, 403);
    }
    
    // Find and update application
    const applicationIndex = notice.applications.findIndex((app: any) => app.id === applicationId);
    if (applicationIndex === -1) {
      return c.json({ error: "Application not found" }, 404);
    }
    
    notice.applications[applicationIndex].status = status;
    notice.applications[applicationIndex].updatedAt = new Date().toISOString();
    
    // If accepting, mark notice as filled and reject other applications
    if (status === 'accepted') {
      notice.status = 'filled';
      notice.selectedStudentId = notice.applications[applicationIndex].studentId;
      
      // Reject all other pending applications
      notice.applications.forEach((app: any) => {
        if (app.id !== applicationId && app.status === 'pending') {
          app.status = 'rejected';
          app.updatedAt = new Date().toISOString();
        }
      });
    }
    
    await kv.set(noticeKey, JSON.stringify(notice));
    
    return c.json({ 
      message: "Application status updated successfully", 
      application: notice.applications[applicationIndex] 
    });
    
  } catch (error) {
    console.log(`Server error updating application status: ${error}`);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);