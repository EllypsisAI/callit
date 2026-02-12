/**
 * Static club configuration for the CREW FIFA 2v2 tournament.
 * All 16 teams with their players, colors, and display info.
 * Used by match cards (club badges), admin panel (team selector), etc.
 */

export type ClubConfig = {
  /** Club name as stored in DB (club_a / club_b) */
  club: string;
  /** Full official name */
  fullName: string;
  /** 2-4 letter abbreviation for badges */
  shortName: string;
  /** Player pair in this tournament */
  players: string;
  /** Team number from the draft (1-16) */
  teamNumber: number;
  /** Primary kit color (hex) */
  primaryColor: string;
  /** Secondary kit color (hex) */
  secondaryColor: string;
  /** Text color on primary background */
  textOnPrimary: string;
};

export const CLUBS: ClubConfig[] = [
  {
    club: "PSG",
    fullName: "Paris Saint-Germain",
    shortName: "PSG",
    players: "Sønder & Wendel",
    teamNumber: 1,
    primaryColor: "#004170",
    secondaryColor: "#DA291C",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Dortmund",
    fullName: "Borussia Dortmund",
    shortName: "BVB",
    players: "Hav & Kamal",
    teamNumber: 2,
    primaryColor: "#FDE100",
    secondaryColor: "#000000",
    textOnPrimary: "#000000",
  },
  {
    club: "Newcastle",
    fullName: "Newcastle United",
    shortName: "NEW",
    players: "Fouli & Ali",
    teamNumber: 3,
    primaryColor: "#241F20",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Napoli",
    fullName: "SSC Napoli",
    shortName: "NAP",
    players: "Håb & Mo",
    teamNumber: 4,
    primaryColor: "#12A0D7",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Man City",
    fullName: "Manchester City",
    shortName: "MCI",
    players: "Ibis & Jab",
    teamNumber: 5,
    primaryColor: "#6CABDD",
    secondaryColor: "#1C2C5B",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Liverpool",
    fullName: "Liverpool FC",
    shortName: "LIV",
    players: "Ellie & Jean",
    teamNumber: 6,
    primaryColor: "#C8102E",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "RB Leipzig",
    fullName: "RB Leipzig",
    shortName: "RBL",
    players: "CK & Zack",
    teamNumber: 7,
    primaryColor: "#DD0741",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Man United",
    fullName: "Manchester United",
    shortName: "MUN",
    players: "Oskar & Daniel",
    teamNumber: 8,
    primaryColor: "#DA291C",
    secondaryColor: "#FBE122",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Real Madrid",
    fullName: "Real Madrid CF",
    shortName: "RMA",
    players: "Jeppe & Mads",
    teamNumber: 9,
    primaryColor: "#FEBE10",
    secondaryColor: "#00529F",
    textOnPrimary: "#000000",
  },
  {
    club: "Arsenal",
    fullName: "Arsenal FC",
    shortName: "ARS",
    players: "Jon & Belo",
    teamNumber: 10,
    primaryColor: "#EF0107",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Barcelona",
    fullName: "FC Barcelona",
    shortName: "BAR",
    players: "Mads & Dennis",
    teamNumber: 11,
    primaryColor: "#A50044",
    secondaryColor: "#004D98",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Atletico Madrid",
    fullName: "Atlético de Madrid",
    shortName: "ATM",
    players: "Loke & Omar",
    teamNumber: 12,
    primaryColor: "#CB3524",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Tottenham",
    fullName: "Tottenham Hotspur",
    shortName: "TOT",
    players: "Mads & Victor",
    teamNumber: 13,
    primaryColor: "#132257",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Bayern München",
    fullName: "FC Bayern München",
    shortName: "BAY",
    players: "Skinz & Jimilian",
    teamNumber: 14,
    primaryColor: "#DC052D",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Aston Villa",
    fullName: "Aston Villa FC",
    shortName: "AVL",
    players: "Topgun & Mika",
    teamNumber: 15,
    primaryColor: "#670E36",
    secondaryColor: "#95BFE5",
    textOnPrimary: "#FFFFFF",
  },
  {
    club: "Chelsea",
    fullName: "Chelsea FC",
    shortName: "CHE",
    players: "David & Ray",
    teamNumber: 16,
    primaryColor: "#034694",
    secondaryColor: "#FFFFFF",
    textOnPrimary: "#FFFFFF",
  },
];

/** Lookup club config by club name (as stored in DB) */
export function getClub(clubName: string | null): ClubConfig | undefined {
  if (!clubName) return undefined;
  return CLUBS.find((c) => c.club === clubName);
}

/** Get all club names for admin dropdowns */
export function getClubOptions(): { value: string; label: string; players: string }[] {
  return CLUBS.map((c) => ({
    value: c.club,
    label: `${c.club} — ${c.players}`,
    players: c.players,
  }));
}
