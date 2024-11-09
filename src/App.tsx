import React, { useState, useEffect } from "react";
import "./App.css";
import { Chat } from "./client/Chat";

interface Player {
  name: string;
  team: string;
  health: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  isAlive: boolean;
  killer?: string;
}

const teamColors: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
};

const initialPlayers = (names: string[]) => {
  return names.map((name, index) => ({
    name,
    team: ["red", "blue", "green", "yellow"][index % 4],
    health: 100,
    x: Math.random() * 800,
    y: Math.random() * 600,
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2,
    isAlive: true,
  }));
};


const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(initialPlayers(["Bot1", "Bot2", "Bot3", "Bot4"]));


  const chat = new Chat('kanipuff', (parsed) => {
    setPlayers((prevPlayers) => {
      if (prevPlayers.find(player => player.name === parsed.username)) {
        if (parsed.message === "!revive") {
          return prevPlayers.map(player => player.name === parsed.username ? { ...player, isAlive: true, health: 50 } : player);
        }
        return prevPlayers
      };
      if (parsed.username.length > 100) return prevPlayers;
      return [...prevPlayers, {
        name: parsed.username,
        team: ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)],
        health: 100,
        x: Math.random() * 800,
        y: Math.random() * 600,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        isAlive: true,
      }];
    })
  });
  useEffect(() => {
    chat.connect();
  }, [])

  const updatePlayers = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => {
        if (!player.isAlive) return player;

        let newX = player.x + player.dx;
        let newY = player.y + player.dy;

        // Bounce off edges
        if (newX <= 0 || newX >= 800) player.dx *= -1;
        if (newY <= 0 || newY >= 600) player.dy *= -1;

        // Update position
        player.x = Math.min(Math.max(newX, 0), 800);
        player.y = Math.min(Math.max(newY, 0), 600);

        // Collision detection with other players
        prevPlayers.forEach((other) => {
          if (other.name !== player.name && other.isAlive) {
            const distance = Math.hypot(player.x - other.x, player.y - other.y);
            if (distance < 20) {
              if (player.team === other.team) {
                player.health = Math.min(player.health + 1, 100);
                other.health = Math.min(other.health + 1, 100);
              } else {
                player.health = Math.max(player.health - 1, 0);
                other.health = Math.max(other.health - 1, 0);

                if (player.health === 0) {
                  player.isAlive = false;
                  player.killer = other.name;
                }
                if (other.health === 0) {
                  other.isAlive = false;
                  other.killer = player.name;
                }
              }
            }
          }
        });

        return { ...player };
      })
    );
  };

  useEffect(() => {
    const interval = setInterval(updatePlayers, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {players.map((player) => (
        <div
          key={player.name}
          className={`absolute w-14 h-14 flex items-center justify-center rounded-full text-white ${teamColors[player.team]
            }`}
          style={{
            left: player.x,
            top: player.y,
            opacity: player.isAlive ? 1 : 0.5,
          }}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs">{player.name}</div>
            <div className="text-xs">{player.isAlive ? `HP: ${player.health}` : `Killed by ${player.killer}`}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
