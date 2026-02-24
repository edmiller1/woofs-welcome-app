<script lang="ts">
  import type { BAUser } from "@woofs/types";

  interface Props {
    data: {
      user: BAUser | null;
      userName: string;
      userId: string;
    };
  }

  const { data }: Props = $props();
  const { user, userName, userId } = $derived(data);
</script>

<div>Profile Collections page</div>
