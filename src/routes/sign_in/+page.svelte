<script lang="ts">
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { goto } from "$app/navigation";

  let studentId: string = "";
  let password: string = "";

  function signIn() {
    console.log(studentId, password);
    goto("/courses");
  }
</script>

<div class="flex flex-col space-y-4 p-4 self-center">
  <img src="/logo.png" alt="Logo" class="mb-16 mx-auto" />
  <Input placeholder="Student ID" bind:value={studentId} />
  <Input placeholder="Password" type="password" bind:value={password} />
  <Button class="p-6 text-xl bg-secondary text-primary" on:click={signIn}
    >Sign In</Button
  >
</div>
