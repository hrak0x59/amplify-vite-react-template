import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const client = generateClient<Schema>();
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator();

  useEffect(() => {
    const sub = client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
    return () => sub.unsubscribe();
  }, []);

  function createTodo() {
    const content = window.prompt("Todo content");
    // 入力が空でないかを確認し、空であれば何もしない
    if (!content) {
      alert("Please enter a valid todo content!");
      return;
    }
    // 10個以上のtodoを作成できないようにする
    if (todos.length >= 10) {
      alert("You can only have up to 10 todos!");
      return;
    }
    client.models.Todo.create({ content });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s todos</h1>
      <Button variant="contained" onClick={createTodo} sx={{ marginBottom: 2 }}>+ new</Button>
      <Box sx={{ width: '100%' }}>
      <Stack spacing={1}>
      {todos.map((todo) => (
            <Item key={todo.id} elevation={3} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{todo.content}</span>
              <IconButton onClick={() => deleteTodo(todo.id)} color="error">
                <DeleteIcon />
              </IconButton>
            </Item>
          ))}
      </Stack>
      </Box>

      <Button variant="contained" onClick={signOut} sx={{ marginTop: 2 }}>Sign out</Button>
    </main>
  );
}

export default App;
