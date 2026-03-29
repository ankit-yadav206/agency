const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const reveals = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const leadForm = document.querySelector("#leadForm");
const formMessage = document.querySelector("#formMessage");
const chatbotShell = document.querySelector("#chatbotShell");
const chatbotToggle = document.querySelector("#chatbotToggle");
const chatbotClose = document.querySelector("#chatbotClose");
const chatbotPanel = document.querySelector("#chatbotPanel");
const chatbotMessages = document.querySelector("#chatbotMessages");
const chatbotForm = document.querySelector("#chatbotForm");
const chatbotInput = document.querySelector("#chatbotInput");
const chatbotSuggestions = document.querySelector("#chatbotSuggestions");
const chatbotData = window.chatbotKnowledge || {
  welcomeMessage: "Hello. How can I help you today?",
  fallbackMessage: "Please share your question and I will do my best to help.",
  quickReplies: ["Hi", "What services do you offer?"],
  intents: [],
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.18 }
);

reveals.forEach((element) => {
  revealObserver.observe(element);
});

const animateCounter = (element) => {
  const target = Number(element.dataset.counter || 0);
  const duration = 1500;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

const counterObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.7 }
);

counters.forEach((counter) => {
  counterObserver.observe(counter);
});

const getStoredLeads = () => {
  try {
    return JSON.parse(localStorage.getItem("iaa_leads") || "[]");
  } catch (error) {
    return [];
  }
};

const storeLead = (lead) => {
  const leads = getStoredLeads();
  leads.push(lead);
  localStorage.setItem("iaa_leads", JSON.stringify(leads));
};

if (leadForm && formMessage) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(leadForm);
    const data = Object.fromEntries(formData.entries());
    const updatesEnabled = formData.get("updates") === "on";

    const phoneDigits = String(data.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      formMessage.textContent = "Please enter a valid phone number with at least 10 digits.";
      formMessage.className = "form-note error";
      return;
    }

    const leadRecord = {
      ...data,
      updates: updatesEnabled,
      createdAt: new Date().toISOString(),
    };

    storeLead(leadRecord);

    formMessage.textContent =
      "Inquiry saved successfully. This demo stores the lead in your browser and is ready to connect with your CRM or backend.";
    formMessage.className = "form-note success";
    leadForm.reset();
  });
}

const createChatMessage = (content, sender) => {
  if (!chatbotMessages) {
    return;
  }

  const message = document.createElement("div");
  message.className = `chatbot-message ${sender}`;
  message.textContent = content;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const getChatbotReply = (input) => {
  const normalizedInput = normalizeText(input);

  const matchedIntent = (chatbotData.intents || []).find((intent) =>
    (intent.keywords || []).some((keyword) => normalizedInput.includes(normalizeText(keyword)))
  );

  if (matchedIntent?.response) {
    return matchedIntent.response;
  }

  return chatbotData.fallbackMessage;
};

const setChatbotOpen = (isOpen) => {
  if (!chatbotPanel || !chatbotToggle) {
    return;
  }

  chatbotPanel.hidden = !isOpen;
  chatbotToggle.setAttribute("aria-expanded", String(isOpen));

  if (isOpen && chatbotInput) {
    chatbotInput.focus();
  }
};

if (chatbotMessages) {
  createChatMessage(chatbotData.welcomeMessage, "bot");
}

if (chatbotSuggestions) {
  chatbotSuggestions.innerHTML = "";
  (chatbotData.quickReplies || []).forEach((reply) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chatbot-chip";
    chip.textContent = reply;
    chip.addEventListener("click", () => {
      createChatMessage(reply, "user");
      window.setTimeout(() => {
        createChatMessage(getChatbotReply(reply), "bot");
      }, 280);
      setChatbotOpen(true);
    });
    chatbotSuggestions.appendChild(chip);
  });
}

if (chatbotToggle) {
  chatbotToggle.addEventListener("click", () => {
    const nextState = chatbotPanel?.hidden ?? true;
    setChatbotOpen(nextState);
  });
}

if (chatbotClose) {
  chatbotClose.addEventListener("click", () => {
    setChatbotOpen(false);
  });
}

if (chatbotForm && chatbotInput) {
  chatbotForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = chatbotInput.value.trim();
    if (!question) {
      return;
    }

    createChatMessage(question, "user");
    chatbotInput.value = "";

    window.setTimeout(() => {
      createChatMessage(getChatbotReply(question), "bot");
    }, 320);
  });
}
