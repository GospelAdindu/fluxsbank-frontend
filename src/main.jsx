import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  Landmark,
  LogOut,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  WalletCards
} from "lucide-react";
import "./styles.css";

const initialTransactions = [
  {
    id: "TX-94021",
    title: "Opening deposit",
    type: "credit",
    amount: 8200,
    date: "May 10, 2026",
    recipient: "Fluxsbank Starter Vault"
  },
  {
    id: "TX-94014",
    title: "Card purchase",
    type: "debit",
    amount: 147.9,
    date: "May 8, 2026",
    recipient: "Lagos Office Supplies"
  },
  {
    id: "TX-93982",
    title: "Incoming transfer",
    type: "credit",
    amount: 1250,
    date: "May 6, 2026",
    recipient: "Ari Ventures"
  }
];

const emptySignup = {
  firstName: "",
  lastName: "",
  middleName: "",
  gender: "",
  address: "",
  stateOfOrigin: "",
  email: "",
  phone: "",
  password: ""
};

const emptyTransfer = {
  recipient: "",
  bank: "",
  accountNumber: "",
  amount: "",
  note: ""
};

const USERS_STORAGE_KEY = "fluxsbank-users";

function loadSavedUsers() {
  try {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return savedUsers ? JSON.parse(savedUsers) : [];
  } catch {
    return [];
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function currency(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(value);
}

function accountNumberFromEmail(email) {
  const digits = [...email].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return `80${String(digits).padStart(8, "0").slice(0, 8)}`;
}

function App() {
  const [users, setUsers] = useState(loadSavedUsers);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("signup");
  const [signup, setSignup] = useState(emptySignup);
  const [signin, setSignin] = useState({ email: "", password: "" });
  const [transactions, setTransactions] = useState(initialTransactions);
  const [balance, setBalance] = useState(9302.1);
  const [transfer, setTransfer] = useState(emptyTransfer);
  const [notice, setNotice] = useState("");
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const account = useMemo(() => {
    if (!currentUser) return null;
    return {
      number: accountNumberFromEmail(currentUser.email),
      tier: "Everyday Checking",
      status: "Verified"
    };
  }, [currentUser]);

  function handleSignup(event) {
    event.preventDefault();
    const email = normalizeEmail(signup.email);
    const exists = users.some((user) => user.email === email);
    if (exists) {
      setNotice("An account with this email already exists. Sign in instead.");
      setAuthMode("signin");
      return;
    }

    const user = {
      id: crypto.randomUUID(),
      name: [signup.firstName, signup.middleName, signup.lastName]
        .filter(Boolean)
        .join(" "),
      ...signup,
      email
    };
    setUsers((existing) => [...existing, user]);
    setCurrentUser(user);
    setSignup(emptySignup);
    setNotice("Welcome to Fluxsbank. Your account is ready.");
  }

  function handleSignin(event) {
    event.preventDefault();
    const email = normalizeEmail(signin.email);
    const user = users.find(
      (candidate) =>
        candidate.email === email && candidate.password === signin.password
    );
    if (!user) {
      setNotice("We could not match those credentials. Check your email and password.");
      return;
    }
    setCurrentUser(user);
    setSignin({ email: "", password: "" });
    setNotice("Signed in securely.");
  }

  function handleTransfer(event) {
    event.preventDefault();
    const amount = Number(transfer.amount);
    if (!amount || amount <= 0) {
      setNotice("Enter a valid transfer amount.");
      return;
    }
    if (amount > balance) {
      setNotice("Your transfer is above the available balance.");
      return;
    }

    const record = {
      id: `TX-${Math.floor(10000 + Math.random() * 89999)}`,
      title: transfer.note || "Bank transfer",
      type: "debit",
      amount,
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }).format(new Date()),
      recipient: `${transfer.recipient} • ${transfer.bank}`
    };
    setTransactions((existing) => [record, ...existing]);
    setBalance((current) => current - amount);
    setTransfer(emptyTransfer);
    setNotice(`Transfer of ${currency(amount)} sent to ${record.recipient}.`);
  }

  function deleteAccount() {
    if (!currentUser) return;
    setUsers((existing) => existing.filter((user) => user.id !== currentUser.id));
    setCurrentUser(null);
    setBalance(9302.1);
    setTransactions(initialTransactions);
    setAuthMode("signup");
    setNotice("Account deleted from this demo session.");
  }

  if (!currentUser) {
    return (
      <AuthScreen
        authMode={authMode}
        setAuthMode={setAuthMode}
        signup={signup}
        setSignup={setSignup}
        signin={signin}
        setSignin={setSignin}
        handleSignup={handleSignup}
        handleSignin={handleSignin}
        notice={notice}
      />
    );
  }

  return (
    <Dashboard
      user={currentUser}
      account={account}
      balance={balance}
      showBalance={showBalance}
      setShowBalance={setShowBalance}
      transactions={transactions}
      transfer={transfer}
      setTransfer={setTransfer}
      handleTransfer={handleTransfer}
      deleteAccount={deleteAccount}
      notice={notice}
      signOut={() => {
        setCurrentUser(null);
        setNotice("Signed out of Fluxsbank.");
      }}
    />
  );
}

function AuthScreen({
  authMode,
  setAuthMode,
  signup,
  setSignup,
  signin,
  setSignin,
  handleSignup,
  handleSignin,
  notice
}) {
  const isSignup = authMode === "signup";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <section className="grid min-h-screen gap-4 p-4 lg:min-h-dvh lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:p-6">
        <div className="auth-hero relative flex h-full min-h-0 flex-col justify-between overflow-hidden text-[#FFFFFF]">
          <div className="relative z-10 flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 text-[#FFFFFF] sm:h-11 sm:w-11">
              <Landmark size={24} />
            </div>
            <span className="text-xl font-bold tracking-normal text-[#FFFFFF]">Fluxsbank</span>
          </div>
          <div className="auth-hero-content relative z-10 max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm text-[#FFFFFF] backdrop-blur">
              <ShieldCheck size={16} />
              Digital banking for everyday flow
            </p>
            <h1 className="text-3xl font-bold leading-tight text-[#FFFFFF] sm:text-5xl lg:text-6xl">
              Move money, check balances, and keep every transaction in view.
            </h1>
            <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-3">
              {["Instant account setup", "Protected sign in", "Transfer tracking"].map(
                (item) => (
                  <div
                    className="rounded-lg border border-white/16 bg-white/10 p-4 backdrop-blur"
                    key={item}
                  >
                    <CheckCircle2 className="mb-4 text-mint" size={20} />
                    <p className="text-sm font-medium text-[#FFFFFF]">{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="auth-form-panel flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="mb-6 sm:mb-7">
              <p className="text-sm font-semibold uppercase text-brand/80">
                {isSignup ? "Create account" : "Welcome back"}
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                {isSignup ? "Start banking with Fluxsbank" : "Sign in to your dashboard"}
              </h2>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-lg bg-white p-0.5 shadow-sm">
              <button
                className={`auth-segment-button rounded-md text-xs font-semibold transition sm:text-sm ${
                  isSignup ? "bg-[rgba(67,22,143,0.8)] text-white" : "text-ink/70 hover:text-ink"
                }`}
                type="button"
                onClick={() => setAuthMode("signup")}
              >
                Sign up
              </button>
              <button
                className={`auth-segment-button rounded-md text-xs font-semibold transition sm:text-sm ${
                  !isSignup ? "bg-[rgba(67,22,143,0.8)] text-white" : "text-ink/70 hover:text-ink"
                }`}
                type="button"
                onClick={() => setAuthMode("signin")}
              >
                Sign in
              </button>
            </div>

            {notice && <Notice>{notice}</Notice>}

            {isSignup ? (
              <form className="form-stack" onSubmit={handleSignup}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="First name"
                    value={signup.firstName}
                    onChange={(value) => setSignup({ ...signup, firstName: value })}
                    placeholder="Morgan"
                    required
                  />
                  <Field
                    label="Last name"
                    value={signup.lastName}
                    onChange={(value) => setSignup({ ...signup, lastName: value })}
                    placeholder="Taylor"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Middle name"
                    value={signup.middleName}
                    onChange={(value) => setSignup({ ...signup, middleName: value })}
                    placeholder="Ari"
                  />
                  <SelectField
                    label="Gender"
                    value={signup.gender}
                    onChange={(value) => setSignup({ ...signup, gender: value })}
                    required
                    options={["Female", "Male", "Non-binary", "Prefer not to say"]}
                  />
                </div>
                <Field
                  label="Address"
                  value={signup.address}
                  onChange={(value) => setSignup({ ...signup, address: value })}
                  placeholder="24 Marina Road, Lagos"
                  required
                />
                <Field
                  label="State of origin"
                  value={signup.stateOfOrigin}
                  onChange={(value) => setSignup({ ...signup, stateOfOrigin: value })}
                  placeholder="Lagos"
                  required
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Email address"
                    inputMode="email"
                    value={signup.email}
                    onChange={(value) => setSignup({ ...signup, email: value })}
                    placeholder="morgan@example.com"
                    required
                  />
                  <Field
                    label="Phone number"
                    type="tel"
                    value={signup.phone}
                    onChange={(value) => setSignup({ ...signup, phone: value })}
                    placeholder="+234 801 234 5678"
                    required
                  />
                </div>
                <Field
                  label="Password"
                  type="password"
                  value={signup.password}
                  onChange={(value) => setSignup({ ...signup, password: value })}
                  placeholder="Create a strong password"
                  required
                />
                <button className="primary-button w-full" type="submit">
                  Create account <ChevronRight size={18} />
                </button>
              </form>
            ) : (
              <form className="form-stack" onSubmit={handleSignin}>
                <Field
                  label="Email address"
                  inputMode="email"
                  value={signin.email}
                  onChange={(value) => setSignin({ ...signin, email: value })}
                  placeholder="morgan@example.com"
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={signin.password}
                  onChange={(value) => setSignin({ ...signin, password: value })}
                  placeholder="Your password"
                  required
                />
                <button className="primary-button primary-button--signin w-full" type="submit">
                  Sign in <ChevronRight size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard({
  user,
  account,
  balance,
  showBalance,
  setShowBalance,
  transactions,
  transfer,
  setTransfer,
  handleTransfer,
  deleteAccount,
  notice,
  signOut
}) {
  const income = transactions
    .filter((item) => item.type === "credit")
    .reduce((sum, item) => sum + item.amount, 0);
  const spending = transactions
    .filter((item) => item.type === "debit")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="bg-brand/80 text-white">
        <div className="app-container flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-white/15 text-white">
              <Landmark size={22} />
            </div>
            <div>
              <p className="text-lg font-bold">Fluxsbank</p>
              <p className="text-xs font-medium uppercase text-white/65">
                Online banking
              </p>
            </div>
          </div>
          <div className="header-actions flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
            <button
              className="icon-button sign-out-button shrink-0"
              type="button"
              onClick={signOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={19} aria-hidden />
            </button>
            <button
              className="danger-button shrink-0"
              type="button"
              onClick={deleteAccount}
              title="Delete account"
            >
              <Trash2 size={17} aria-hidden />
              <span className="danger-button__label">Delete account</span>
            </button>
          </div>
        </div>
      </header>

      <div className="app-container section-stack grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="balance-panel card-padding">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/70">Available balance</p>
                  <div className="mt-4 flex items-center gap-2 sm:gap-4">
                    <h1 className="break-all text-3xl font-bold sm:text-5xl">
                      {showBalance ? currency(balance) : "₦••••••"}
                    </h1>
                    <button
                      className="square-icon-button grid place-items-center rounded-lg bg-white/12 text-white transition hover:bg-white/18"
                      type="button"
                      onClick={() => setShowBalance(!showBalance)}
                      title={showBalance ? "Hide balance" : "Show balance"}
                    >
                      {showBalance ? <EyeOff size={19} /> : <Eye size={19} />}
                    </button>
                  </div>
                </div>
                <WalletCards className="text-mint" size={34} />
              </div>
              <div className="mt-6 grid gap-4 sm:mt-10 sm:grid-cols-3">
                <MiniStat icon={<UserRound size={18} />} label="Account holder" value={user.name} />
                <MiniStat icon={<Building2 size={18} />} label="Account number" value={account.number} />
                <MiniStat icon={<ShieldCheck size={18} />} label="Status" value={account.status} />
              </div>
            </div>

            <div className="card-padding rounded-lg bg-white shadow-sm">
              <p className="text-sm font-semibold uppercase text-brand/80">Account summary</p>
              <h2 className="mt-2 text-2xl font-bold">{account.tier}</h2>
              <div className="mt-6 space-y-4">
                <SummaryRow label="Money in" value={currency(income)} tone="credit" />
                <SummaryRow label="Money out" value={currency(spending)} tone="debit" />
                <SummaryRow label="Transactions" value={transactions.length} />
              </div>
            </div>
          </div>

          {notice && <Notice>{notice}</Notice>}

          <div className="card-padding rounded-lg bg-white shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase text-brand/80">History</p>
                <h2 className="mt-1 text-xl font-bold sm:text-2xl">Recent transactions</h2>
              </div>
              <span className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink/60">
                {transactions.length} records
              </span>
            </div>
            <div className="divide-y divide-ink/10">
              {transactions.map((item) => (
                <article className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${
                        item.type === "credit"
                          ? "bg-mint/10 text-mint"
                          : "bg-coral/10 text-coral"
                      }`}
                    >
                      {item.type === "credit" ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{item.title}</h3>
                      <p className="truncate text-sm text-ink/55">
                        {item.recipient} • {item.date}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`shrink-0 pl-14 font-bold sm:pl-0 ${
                      item.type === "credit" ? "text-mint" : "text-coral"
                    }`}
                  >
                    {item.type === "credit" ? "+" : "-"}
                    {currency(item.amount)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card-padding rounded-lg bg-white shadow-sm">
            <div className="mb-6 flex items-center gap-4">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-mint/10 text-mint">
                <ArrowRightLeft size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-brand/80">Transfer</p>
                <h2 className="text-xl font-bold">Send money</h2>
              </div>
            </div>

            <form className="form-stack" onSubmit={handleTransfer}>
              <Field
                label="Recipient name"
                value={transfer.recipient}
                onChange={(value) => setTransfer({ ...transfer, recipient: value })}
                placeholder="Jamie Rivers"
                required
              />
              <Field
                label="Bank"
                value={transfer.bank}
                onChange={(value) => setTransfer({ ...transfer, bank: value })}
                placeholder="Summit Trust Bank"
                required
              />
              <Field
                label="Account number"
                inputMode="numeric"
                value={transfer.accountNumber}
                onChange={(value) => setTransfer({ ...transfer, accountNumber: value })}
                placeholder="0123456789"
                required
              />
              <Field
                label="Amount"
                inputMode="decimal"
                value={transfer.amount}
                onChange={(value) => setTransfer({ ...transfer, amount: value })}
                placeholder="250.00"
                required
              />
              <Field
                label="Note"
                value={transfer.note}
                onChange={(value) => setTransfer({ ...transfer, note: value })}
                placeholder="Rent, invoice, savings"
              />
              <button className="primary-button w-full" type="submit">
                <Plus size={18} />
                Make transfer
              </button>
            </form>
          </div>

          <div className="card-padding rounded-lg bg-brand/80 text-white shadow-soft">
            <p className="text-sm font-medium text-white/65">Security center</p>
            <h2 className="mt-2 text-2xl font-bold">Protected session</h2>
            <p className="mt-4 text-sm leading-6 text-white/70">
              This demo keeps banking data in browser state only. Refreshing the page clears
              users, balances, and activity.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/70">{label}</span>
      <input
        className="h-12 w-full rounded-lg border border-ink/12 bg-white px-4 text-base text-ink outline-none transition placeholder:text-ink/35 focus:border-brand/80 focus:ring-4 focus:ring-brand/10"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink/70">{label}</span>
      <select
        className="h-12 w-full rounded-lg border border-ink/12 bg-white px-4 text-base text-ink outline-none transition focus:border-brand/80 focus:ring-4 focus:ring-brand/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        {...props}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <div className="mb-4 text-mint">{icon}</div>
      <p className="text-xs font-medium uppercase text-white/55">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-paper px-4 py-4">
      <span className="text-sm font-semibold text-ink/60">{label}</span>
      <span
        className={`font-bold ${
          tone === "credit" ? "text-mint" : tone === "debit" ? "text-coral" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Notice({ children }) {
  return (
    <div className="mb-6 rounded-lg border border-mint/20 bg-mint/10 px-4 py-4 text-sm font-semibold text-lagoon">
      {children}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
