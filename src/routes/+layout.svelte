<script>
  import "../app.css";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { Button } from "$lib/components/ui/button/index";
  import {
    Upload,
    Undo2,
    Settings,
    LogOut,
    CircleUserRound,
  } from "lucide-svelte";
</script>

<main class="flex flex-col min-h-screen p-4">
  {#if $page.url.pathname !== "/courses" && $page.url.pathname !== "/sign_in"}
    <Button on:click={() => goto("/courses")}><Undo2 /></Button>
  {/if}
  <div class="flex-grow"><slot /></div>
  {#if $page.url.pathname && $page.url.pathname !== "/sign_in"}
    <div class="flex flex-row justify-between">
      <img src="/logo.png" alt="Logo" class="w-32 h-32 self-start" />
      <div class="grid grid-cols-2 gap-2 self-end">
        <Button on:click={() => goto("/submit")}>
          <Upload />
        </Button>
        <Button on:click={() => goto("/account")}><CircleUserRound /></Button>
        <Button on:click={() => goto("/settings")}><Settings /></Button>
        <Button on:click={() => goto("/sign_in")}><LogOut /></Button>
      </div>
    </div>
  {/if}
</main>
