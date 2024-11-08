import React, { useState, useEffect } from "react";
import "./App.css";

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
  const [players, setPlayers] = useState<Player[]>(initialPlayers(["Alice", "Bob", "Charlie", "Diana"]));

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
            if (distance < 40) {
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
          className={`absolute w-10 h-10 flex items-center justify-center rounded-full text-white ${teamColors[player.team]
            }`}
          style={{
            left: player.x,
            top: player.y,
            opacity: player.isAlive ? 1 : 0.5,
          }}
        >
          {player.isAlive ? player.name : `Killed by ${player.killer}`}
        </div>
      ))}
    </div>
  );
};

export default App;
