<script>
    // Placeholder for the server URL
    const HOST = "http://localhost:3000";

    let valves = ['MAM'];
    let valveStates = {};

    // Initialize valve states
    valves.forEach(valve => {
        valveStates[valve] = false;
    });

    async function toggleValve(valveId) {
        try {
            const response = await fetch(`${HOST}/open/${valveId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: !valveStates[valveId] })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.actionId) {
                    waitForAcknowledgement(data.actionId, valveId);
                }
            }
        } catch (error) {
            console.error('Error toggling valve:', error);
        }
    }

    async function waitForAcknowledgement(actionId, valveId) {
        try {
            const response = await fetch(`${HOST}/acknowledged/${actionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.acknowledged) {
                    valveStates[valveId] = !valveStates[valveId];
                } else {
                    setTimeout(() => {
                        waitForAcknowledgement(actionId, valveId);
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error waiting for acknowledgement:', error);
        }
    }
</script>

<style>
    /* Add your CSS styles here */
</style>

<main>
    <h1>Welcome to the IoT Valve Controller</h1>
    {#each valves as valve}
        <div class="valve-control">
            <h2>{valve} - Status: {valveStates[valve] ? 'OPEN' : 'CLOSED'}</h2>
            <button on:click={() => toggleValve(valve)}>
                Toggle {valve}
            </button>
        </div>
    {/each}
</main>
