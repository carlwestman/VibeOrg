# MCP Server Reference

This project uses MCP (Model Context Protocol) servers to give agents access to external tools and data. Servers are configured in `.mcp.json` and assigned to agents in `agents/agents.json`.

---

## Configured Servers

<!-- Populated during onboarding. Each server entry should follow this format:

### [server-key]
- **Source:** github:user/repo or URL
- **Purpose:** What this server provides
- **Tools:** N tools — brief list of key tools
- **API key required:** Yes/No (key name in .env)
- **Assigned to:** Agent names and their usage context
- **Documentation:** Link to README or docs

-->

*No MCP servers configured yet. Run `/init` or tell Claude to add a server.*

---

## Adding a New MCP Server

You can add a new MCP server at any time by telling Claude:

```
"Add this MCP server: github.com/user/repo-name"
```

Claude will fetch the README, discover the tools, configure `.mcp.json`, and ask which agents should have access.

### Manual Setup

If you prefer to add one manually:

1. Add it to `.mcp.json` with the appropriate command and args
2. Add any required API keys to `.env` and `.env.example`
3. Run `claude /mcp` to verify the server starts and list its tools
4. Update `agents/agents.json` to assign the server to relevant agents (add to `mcp_tools` array and `mcp_tool_notes`)
5. Update the assigned agents' `TOOLS.md` files with tool documentation
6. Update this file with the server's details
7. Restart Claude Code for `.mcp.json` changes to take effect
