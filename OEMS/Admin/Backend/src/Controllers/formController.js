import { v4 as uuidv4 } from "uuid";
import { connection } from "../server.js";
import {
  BAD_REQUEST,
  SERVER_ERROR,
  STATUS_OK,
  NOT_FOUND,
} from "../Constants/httpStatus.js";

export const getFields = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    "SELECT * FROM FieldTable WHERE formId = ?",
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error fetching fields:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }
      res.status(STATUS_OK).json(results);
    }
  );
};

export const getForms = (req, res) => {
  connection.query(
    "SELECT * FROM FormTable",
    (err, results) => {
      if (err) {
        console.error("Error fetching forms:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res.status(STATUS_OK).json(results);
    }
  );
};

export const updateField = (req, res) => {
  const { formId, fieldId } = req.params;
  const { label, placeholder, textArea, options, questions, rta } = req.body;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  if (!label) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Type, label, and placeholder are required" });
  }

  connection.query(
    "UPDATE FieldTable SET label = ?, placeholder = ?, textArea = ?, options = ?, questions = ?, rta = ? WHERE formId = ? AND fieldId = ?",
    [
      label,
      placeholder,
      textArea,
      JSON.stringify(options),
      JSON.stringify(questions),
      rta,
      formId,
      fieldId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field updated successfully" });
    }
  );
};

export const deleteField = (req, res) => {
  const { formId, fieldId } = req.params;

  if (!formId || !fieldId) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "formId and fieldId are required" });
  }

  connection.query(
    "DELETE FROM FieldTable WHERE formId = ? AND fieldId = ?",
    [formId, fieldId],
    (err, results) => {
      if (err) {
        console.error("Error deleting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Field not found" });
      }

      res.status(STATUS_OK).json({ message: "Field deleted successfully" });
    }
  );
};

export const addField = (req, res) => {
  const { formId } = req.params;
  const { fieldId, type, label, placeholder, textArea, options, questions, rta } =
    req.body;

  if (!formId || !type || !label || !placeholder) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Required fields are missing" });
  }

  const query = `
      INSERT INTO FieldTable (fieldId, formId, type, label, placeholder, textArea, options, questions, rta)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  connection.query(
    query,
    [
      fieldId,
      formId,
      type,
      label,
      placeholder,
      textArea || null,
      JSON.stringify(options || {}),
      JSON.stringify(questions || {}),
      rta || null,
    ],
    (err, results) => {
      if (err) {
        console.error("Error inserting field:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res
        .status(STATUS_OK)
        .json({ message: "Field added successfully", fieldId });
    }
  );
};

export const createForm = (req, res) => {
  const { formId, label, description, manager, startContent, endContent, duration } = req.body;

  if (!label || !duration || !manager) {
    return res
      .status(BAD_REQUEST)
      .json({ message: "Missing required fields" });
  }

  connection.query(
    `INSERT INTO FormTable (formId, label, description, startContent, endContent, duration, manager)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      formId,
      label || null,
      description,
      startContent || null,
      endContent || null,
      duration,
      manager
    ],
    (err, results) => {
      if (err) {
        console.error("Error creating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      res
        .status(STATUS_OK)
        .json({ message: "Form created successfully", formId });
    }
  );
};

export const updateForm = (req, res) => {
  const { formId } = req.params;
  const { label, description, startContent, endContent, duration } = req.body;

  if (!label) {
    return res.status(BAD_REQUEST).json({ message: "Label is required" });
  }

  connection.query(
    `UPDATE FormTable 
       SET label = ?, description = ?, startContent = ?, endContent = ?, duration = ?
       WHERE formId = ?`,
    [
      label,
      description || null,
      startContent || null,
      endContent || null,
      duration,
      formId,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json({ message: "Form updated successfully" });
    }
  );
};

export const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(UNAUTHORIZED);

  jwt.verify(refreshToken, process.env.REFRESH_KEY, (err, user) => {
    if (err) return res.sendStatus(UNAUTHORIZED);

    const newAccessToken = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({ accessToken: newAccessToken });
  });
};

export const deleteForm = (req, res) => {
  const { formId } = req.params;

  if (!formId) {
    return res.status(BAD_REQUEST).json({ message: "formId is required" });
  }

  connection.query(
    `DELETE FROM FormTable WHERE formId = ?`,
    [formId],
    (err, results) => {
      if (err) {
        console.error("Error deleting form:", err);
        return res.status(SERVER_ERROR).json({ error: "Server error" });
      }

      if (results.affectedRows === 0) {
        return res.status(NOT_FOUND).json({ message: "Form not found" });
      }

      res.status(STATUS_OK).json({ message: "Form deleted successfully" });
    }
  );
};

export const submitForm = (req, res) => {
    const { formId } = req.params;
    const { responseId, value, ip, userEmail, startTime, endTime, duration } = req.body;
  
    if (!formId || !value || !ip || !userEmail) {
      return res
        .status(BAD_REQUEST)
        .json({ message: "Required fields are missing" });
    }
  
    const query = `
        INSERT INTO ValueTable (responseId, formId, value, ip, userEmail, startTime, endTime, duration)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
    connection.query(
      query,
      [
        responseId,
        formId,
        JSON.stringify(value),
        ip,
        userEmail,
        startTime || null,
        endTime || null,
        duration || null,
      ],
      (err, results) => {
        if (err) {
          console.error("Error submitting form response:", err);
          return res.status(SERVER_ERROR).json({ error: "Server error" });
        }
  
        res.status(STATUS_OK).json({ message: "Response submitted", responseId });
      }
    );
  };
  
  export const getSubmissions = (req, res) => {
    const { formId } = req.params;
  
    if (!formId) {
      return res.status(BAD_REQUEST).json({ message: "formId is required" });
    }
  
    connection.query(
      `SELECT * FROM ValueTable WHERE formId = ?`,
      [formId],
      (err, results) => {
        if (err) {
          console.error("Error fetching submissions:", err);
          return res.status(SERVER_ERROR).json({ error: "Server error" });
        }
  
        res.status(STATUS_OK).json(results);
      }
    );
  };
