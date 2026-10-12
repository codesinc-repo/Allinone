import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import usersData from "@/data/users.json";
import operatorsData from "@/data/operators.json";
import categoriesData from "@/data/categories.json";
import listingsData from "@/data/listings.json";
import providersData from "@/data/providers.json";
import directoryData from "@/data/directory.json";

import type {
  Category,
  CategoryModule,
  DirectoryEntry,
  Inquiry,
  Listing,
  Operator,
  Review,
  ServiceProvider,
  ServiceRequest,
  Transaction,
  User,
} from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "super_app_state_v1";

type Mutable = {
  listings: Listing[];
  providers: ServiceProvider[];
  directory: DirectoryEntry[];
  transactions: Transaction[];
  inquiries: Inquiry[];
  serviceRequests: ServiceRequest[];
  reviews: Review[];
  currentUserId: string | null;
  users: User[];
};

type Ctx = Mutable & {
  // read-only
  operators: Operator[];
  categories: Record<CategoryModule, Category[]>;
  currentUser: User | null;

  // actions
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (name: string, email: string, password: string, phone: string) => Promise<User>;
  signOut: () => Promise<void>;

  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "userId">) => Transaction;
  addInquiry: (listingId: string, message: string, contact: string) => Inquiry | null;
  addListing: (l: Omit<Listing, "id" | "createdAt" | "sellerId">) => Listing | null;
  updateListingStatus: (id: string, status: NonNullable<Listing["status"]>) => void;
  addRequest: (providerId: string, description: string, location: string, preferredTime: string) => ServiceRequest | null;
  addReview: (providerId: string, rating: number, comment: string) => Review | null;
  reset: () => Promise<void>;
};

const StoreContext = createContext<Ctx | null>(null);

const SEED: Mutable = {
  listings: listingsData as any,
  providers: providersData as any,
  directory: directoryData as any,
  transactions: [
    {
      id: "t_seed1",
      userId: "u_priya",
      operatorId: "op_jio",
      type: "MOBILE",
      amount: 299,
      reference: "9811111111",
      status: "SUCCESS",
      providerRef: "MOCK-MOB-DEMO01",
      message: "Transaction completed by mock provider.",
      createdAt: "2026-10-08T09:30:00Z",
    },
    {
      id: "t_seed2",
      userId: "u_priya",
      operatorId: "op_geb",
      type: "ELECTRICITY",
      amount: 1245,
      reference: "GEB-5567123",
      status: "SUCCESS",
      providerRef: "MOCK-ELE-DEMO02",
      message: "Transaction completed by mock provider.",
      createdAt: "2026-10-06T14:20:00Z",
    },
    {
      id: "t_seed3",
      userId: "u_priya",
      operatorId: "op_tataplay",
      type: "DTH",
      amount: 450,
      reference: "100012345678",
      status: "PENDING",
      providerRef: "MOCK-DTH-DEMO03",
      message: "Awaiting provider confirmation.",
      createdAt: "2026-10-10T08:15:00Z",
    },
  ],
  inquiries: [],
  serviceRequests: [],
  reviews: [
    {
      id: "r_seed1",
      providerId: "p_rajesh",
      userId: "u_priya",
      rating: 5,
      comment: "Rajesh fixed everything in 20 minutes. Super responsive.",
      createdAt: "2026-09-30T10:00:00Z",
    },
    {
      id: "r_seed2",
      providerId: "p_shine",
      userId: "u_rohit",
      rating: 5,
      comment: "Our kitchen looks brand new. Totally worth it.",
      createdAt: "2026-10-01T10:00:00Z",
    },
  ],
  currentUserId: null,
  users: usersData as any,
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Mutable>(SEED);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Mutable;
          // merge: keep seed arrays, append persisted user-generated items
          setState({
            ...SEED,
            ...parsed,
            // always keep static users list intact
            users: SEED.users,
          });
        }
      } catch (e) {
        console.warn("hydrate failed", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null;

  const api: Ctx = {
    ...state,
    operators: operatorsData as any,
    categories: categoriesData as any,
    currentUser,

    async signIn(email, password) {
      const u = state.users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!u) return null;
      setState((s) => ({ ...s, currentUserId: u.id }));
      return u;
    },

    async signUp(name, email, password, phone) {
      const existing = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) throw new Error("Email already registered");
      const u: User = { id: uid("u"), name, email, password, phone, role: "USER" };
      setState((s) => ({ ...s, users: [...s.users, u], currentUserId: u.id }));
      return u;
    },

    async signOut() {
      setState((s) => ({ ...s, currentUserId: null }));
    },

    addTransaction(t) {
      if (!state.currentUserId) throw new Error("Must sign in to transact");
      const txn: Transaction = {
        ...t,
        id: uid("t"),
        userId: state.currentUserId,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, transactions: [txn, ...s.transactions] }));
      return txn;
    },

    addInquiry(listingId, message, contact) {
      if (!state.currentUserId) return null;
      const i: Inquiry = {
        id: uid("i"),
        listingId,
        buyerId: state.currentUserId,
        message,
        contact,
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, inquiries: [i, ...s.inquiries] }));
      return i;
    },

    addListing(l) {
      if (!state.currentUserId) return null;
      const listing: Listing = {
        ...l,
        id: uid("l"),
        sellerId: state.currentUserId,
        createdAt: new Date().toISOString(),
        status: "ACTIVE",
      };
      setState((s) => ({ ...s, listings: [listing, ...s.listings] }));
      return listing;
    },

    updateListingStatus(id, status) {
      setState((s) => ({
        ...s,
        listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)),
      }));
    },

    addRequest(providerId, description, location, preferredTime) {
      if (!state.currentUserId) return null;
      const r: ServiceRequest = {
        id: uid("sr"),
        providerId,
        userId: state.currentUserId,
        description,
        location,
        preferredTime,
        status: "NEW",
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, serviceRequests: [r, ...s.serviceRequests] }));
      return r;
    },

    addReview(providerId, rating, comment) {
      if (!state.currentUserId) return null;
      const r: Review = {
        id: uid("rv"),
        providerId,
        userId: state.currentUserId,
        rating,
        comment,
        createdAt: new Date().toISOString(),
      };
      setState((s) => {
        // bump provider rating
        const provReviews = [...s.reviews.filter((rv) => rv.providerId === providerId), r];
        const avg = provReviews.reduce((n, rv) => n + rv.rating, 0) / provReviews.length;
        return {
          ...s,
          reviews: [r, ...s.reviews],
          providers: s.providers.map((p) =>
            p.id === providerId
              ? { ...p, rating: Math.round(avg * 10) / 10, reviewCount: provReviews.length }
              : p,
          ),
        };
      });
      return r;
    },

    async reset() {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setState(SEED);
    },
  };

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}
