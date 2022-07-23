import { useLoaderData, Form, useActionData } from "@remix-run/react";
import { checkStatus, checkEnvVars } from "~/utils/errorHandling";

export async function loader() {
  checkEnvVars();

  const res = await fetch(`${process.env.STRAPI_URL_BASE}/api/notes`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${process.env.STRAPI_API_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  // Handle HTTP response code < 200 or >= 300
  checkStatus(res);

  const data = await res.json();

  // Did Strapi return an error object in its response?
  if (data.error) {
    console.log('Error', data.error)
    throw new Response("Error getting data from Strapi", { status: 500 })
  }

  return data.data;
}

const addNote = async (formData) => {
  checkEnvVars();

  const response = await fetch(`${process.env.STRAPI_URL_BASE}/api/notes`, {
    method: "POST",
    body: JSON.stringify({
      "data": {
        "title": formData.title,
        "description": formData.description
      }
    }),
    headers: {
      "Authorization": `Bearer ${process.env.STRAPI_API_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  // Handle HTTP response code < 200 or >= 300
  checkStatus(response);

  const data = await response.json();

  // Did Strapi return an error object in its response?
  if (data.error) {
    console.log('Error', data.error)
    throw new Response("Error getting data from Strapi", { status: 500 })
  }

  return data.data;
}

const deleteNote = async (noteId) => {
  const response = await fetch(`http://localhost:1337/api/notes/${noteId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer your_api_token`,
      "Content-Type": "application/json"
    }
  });

  // Handle HTTP response code < 200 or >= 300
  checkStatus(response);

  const data = await response.json();

  // Did Strapi return an error object in its response?
  if (data.error) {
    console.log('Error', data.error)
    throw new Response("Error getting data from Strapi", { status: 500 })
  }

  window.location.reload();
}

export async function action({ request }) {
  const data = Object.fromEntries(await request.formData());

  // send data to the server i.e strapi.
  if (data.title && data.description) {
    let response = await addNote(data);
    return response;
  } else {
    return null;
  }
}

export default function Index() {
  const notes = useLoaderData();
  const actionData = useActionData();
  console.log("actionData", actionData);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Notes App</h1>
      <Form
        method="post">
        <div>
          <input type="text" name="title" placeholder="title of note" />
        </div>
        <div>
          <input type="text" name="description" placeholder="Description of note" />
        </div>
        <div>
          <button type="submit">
            add note
          </button>
        </div>
      </Form>
      {
        notes.length > 0 ? (
          notes.map((note, index) => (
            <div key={index}>
              <h3>{note.attributes.title}</h3>
              <p>{note.attributes.description}</p>
              <p>{new Date(note.attributes.createdAt).toLocaleDateString()}</p>
              <button onClick={() => deleteNote(note.id)}>
                delete note
              </button>
            </div>
          ))
        ) : (
          <div>
            <h3>Sorry!!, you do not have notes yet!!</h3>
          </div>
        )
      }
    </div>
  );
}