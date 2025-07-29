# Supabase JS playground

A free and open source tool to run and debug your Supabase JS client code with real data - no setup, no boilerplate.

Inspired by the SQL playground in the Supabase dashboard, but built for testing Supabase JS client queries directly. Quickly check what your JS client code is going to return, without needing to setup a full fledged app.

**Example:**

You have this `await supabase.from('todos').select()` in your app, you can navigate to the playground, and put in this snippet in the Database Query tab and run the query. You will see what this snippet returns when using the `Anon` key. 

You can add your service key and toggle to use it and see what using a service key returns (Quite useful when working in the backend). 

You can also impersonate a user, by clicking on the impersonate user button and providing a user's email. Now the same query will return the data that this user can see.

### Features

✅ Instantly test your client code <br/>
🔐 Check what anon & service key can access <br/>
👤 Impersonate users to debug RLS policies and to see what data can they access <br/>
🧠 Call your RPC functions directly <br/>

**🛡️Note:** Supabase API url and keys are stored in the browsers local storage. No data is stored/sent to our server.

## Local setup

Clone the repository to your local and cd into the directory.

**Install dependencies**

`npm install`

Start local server

`npm run dev`

No environment variables are needed for local setup.
