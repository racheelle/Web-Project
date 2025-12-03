// controllers/plannerController.js
import db from "../utils/database.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const TIME_SLOTS = (() => {
  const slots = [];
  let hour = 6;
  let minute = 0;

  while (hour < 24 || (hour === 24 && minute === 0)) {
    const startH = String(hour).padStart(2, "0");
    const startM = String(minute).padStart(2, "0");

    let endHour = hour;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
      endMinute -= 60;
      endHour += 1;
    }
    const endH = String(endHour).padStart(2, "0");
    const endM = String(endMinute).padStart(2, "0");

    slots.push(`${startH}:${startM} - ${endH}:${endM}`);

    hour = endHour;
    minute = endMinute;
    if (hour === 24 && minute === 0) break;
  }

  return slots;
})();

const formatDate = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    return value.slice(0, 10);
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return "";
};

export const getPlannerList = async (req, res) => {
  try {
    const [planners] = await db.query(
      `SELECT id, name, start_date, end_date, created_at
       FROM planners
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.session.user.id]
    );

    res.render("planner-list", {
      pageTitle: "My Planners",
      planners,
      user: req.session.user,
      isAuthenticated: true,
    });
  } catch (err) {
    console.error("getPlannerList error:", err);
    res.status(500).render("planner-list", {
      pageTitle: "My Planners",
      planners: [],
      errorMessage: "Could not load planners.",
      user: req.session.user,
      isAuthenticated: true,
    });
  }
};

export const getPlannerNew = async (req, res) => {
  const today = new Date().toISOString().split("T")[0];

  const [places] = await db.query(
    "SELECT id, name FROM places ORDER BY name"
  );

  res.render("planner", {
    pageTitle: "Weekly Planner",
    mode: "new",
    planner: {
      id: null,
      name: "",
      start_date: today,
      end_date: today,
    },
    days: DAYS,
    timeSlots: TIME_SLOTS,
    items: {},
    viewType: "weekly",
    viewDay: "Mon",
    places,
    user: req.session.user,
    isAuthenticated: true,
  });
};

export const postPlannerNew = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;

    const [result] = await db.query(
      `INSERT INTO planners (user_id, name, start_date, end_date)
       VALUES (?, ?, ?, ?)`,
      [req.session.user.id, name, start_date, end_date]
    );

    const newId = result.insertId;
    return res.redirect(`/planner/${newId}`);
  } catch (err) {
    console.error("postPlannerNew error:", err);
    res.status(500).send("Error creating planner");
  }
};

export const getPlannerView = async (req, res) => {
  const plannerId = req.params.id;
  const viewType = req.query.view === "daily" ? "daily" : "weekly";
  const viewDay = DAYS.includes(req.query.day) ? req.query.day : "Mon";

  try {
    const [plannerRows] = await db.query(
      `SELECT * FROM planners
       WHERE id = ? AND user_id = ?`,
      [plannerId, req.session.user.id]
    );

    if (!plannerRows.length) {
      return res.status(404).render("404", {
        pageTitle: "Planner Not Found",
      });
    }

    const planner = plannerRows[0];
    planner.start_date = formatDate(planner.start_date);
    planner.end_date = formatDate(planner.end_date);

    const [itemRows] = await db.query(
      `SELECT day, time_range, activity
       FROM planner_items
       WHERE planner_id = ?`,
      [plannerId]
    );

    const items = {};
    DAYS.forEach((d) => {
      items[d] = {};
    });

    itemRows.forEach((row) => {
      if (!items[row.day]) items[row.day] = {};
      items[row.day][row.time_range] = row.activity;
    });

    const [places] = await db.query(
      "SELECT id, name FROM places ORDER BY name"
    );

    res.render("planner", {
      pageTitle: "Weekly Planner",
      mode: "view",
      planner,
      days: DAYS,
      timeSlots: TIME_SLOTS,
      items,
      viewType,
      viewDay,
      places,
      user: req.session.user,
      isAuthenticated: true,
    });
  } catch (err) {
    console.error("getPlannerView error:", err);
    res.status(500).send("Error loading planner");
  }
};

export const postPlannerUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, start_date, end_date } = req.body;

    await db.query(
      `UPDATE planners
       SET name = ?, start_date = ?, end_date = ?
       WHERE id = ? AND user_id = ?`,
      [name, start_date, end_date, id, req.session.user.id]
    );

    return res.redirect(`/planner/${id}`);
  } catch (err) {
    console.error("postPlannerUpdate error:", err);
    res.status(500).send("Error updating planner");
  }
};

export const savePlannerItem = async (req, res) => {
  try {
    const plannerId = req.params.id;
    const { day, time_range, activity } = req.body;

    if (!DAYS.includes(day) || !time_range) {
      return res.status(400).json({ success: false });
    }

    await db.query(
      `DELETE FROM planner_items
       WHERE planner_id = ? AND day = ? AND time_range = ?`,
      [plannerId, day, time_range]
    );

    if (activity && activity.trim() !== "") {
      await db.query(
        `INSERT INTO planner_items
         (planner_id, day, time_range, activity)
         VALUES (?, ?, ?, ?)`,
        [plannerId, day, time_range, activity.trim()]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("savePlannerItem error:", err);
    res.status(500).json({ success: false });
  }
};

export const movePlannerItem = async (req, res) => {
  try {
    const plannerId = req.params.id;
    const { fromDay, fromSlot, toDay, toSlot } = req.body;

    if (
      !DAYS.includes(fromDay) ||
      !DAYS.includes(toDay) ||
      !fromSlot ||
      !toSlot
    ) {
      return res.status(400).json({ success: false });
    }

    const [rows] = await db.query(
      `SELECT activity
       FROM planner_items
       WHERE planner_id = ? AND day = ? AND time_range = ?`,
      [plannerId, fromDay, fromSlot]
    );

    if (!rows.length) {
      return res.json({ success: false });
    }

    const activity = rows[0].activity;

    await db.query(
      `DELETE FROM planner_items
       WHERE planner_id = ? AND day = ? AND time_range = ?`,
      [plannerId, fromDay, fromSlot]
    );

    await db.query(
      `DELETE FROM planner_items
       WHERE planner_id = ? AND day = ? AND time_range = ?`,
      [plannerId, toDay, toSlot]
    );

    await db.query(
      `INSERT INTO planner_items
       (planner_id, day, time_range, activity)
       VALUES (?, ?, ?, ?)`,
      [plannerId, toDay, toSlot, activity]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("movePlannerItem error:", err);
    res.status(500).json({ success: false });
  }
};

export const deletePlanner = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `DELETE FROM planners
       WHERE id = ? AND user_id = ?`,
      [id, req.session.user.id]
    );

    res.redirect("/planner");
  } catch (err) {
    console.error("deletePlanner error:", err);
    res.status(500).send("Error deleting planner");
  }
};
