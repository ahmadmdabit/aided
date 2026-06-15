import { fixture, test, Selector } from 'testcafe';
import { SidebarNav } from '../../page-objects/components/SidebarNav';
import { ModalPage } from '../../page-objects/examples/ModalPage';

/**
 * Feature: e2e-testing-testcafe
 * Modal Example Tests
 * Validates: Requirements 4.3
 */

fixture('Modal Example')
  .page('http://localhost:5173')
  .beforeEach(async t => {
    // Wait for the playground to load
    const sidebar = Selector('.sidebar');
    await t.expect(sidebar.exists).ok();
    
    // Navigate to Modal example
    const sidebarNav = new SidebarNav();
    await sidebarNav.clickExample('Modal');
  });

test('Navigate to Modal example', async t => {
  const sidebar = new SidebarNav();
  
  // Verify Modal is active
  const isActive = await sidebar.isExampleActive('Modal');
  await t.expect(isActive).ok('Modal example should be active');
});

test('Open modal via button', async t => {
  const modal = new ModalPage();
  
  // Verify button exists
  await t.expect(modal.openModalButton.exists).ok('Open button should exist');
  
  // Click to open modal
  await modal.openModal();
  
  // Verify modal is visible
  const isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be visible after opening');
});

test('Close modal via close button', async t => {
  const modal = new ModalPage();
  
  // Open the modal
  await modal.openModal();
  
  // Verify it's open
  let isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be open');
  
  // Close via button
  await modal.closeModal();
  
  // Verify it's closed
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).notOk('Modal should be closed after clicking close button');
});

test('Close modal via overlay click', async t => {
  const modal = new ModalPage();
  
  // Open the modal
  await modal.openModal();
  
  // Verify it's open
  let isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be open');
  
  // Close via overlay
  await modal.closeModalViaOverlay();
  
  // Verify it's closed
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).notOk('Modal should be closed after clicking overlay');
});

test('Modal can be opened and closed multiple times', async t => {
  const modal = new ModalPage();
  
  // Test opening and closing 3 times
  for (let i = 0; i < 3; i++) {
    // Open
    await modal.openModal();
    let isVisible = await modal.isModalVisible();
    await t.expect(isVisible).ok(`Modal should be open (iteration ${i + 1})`);
    
    // Close
    await modal.closeModal();
    isVisible = await modal.isModalVisible();
    await t.expect(isVisible).notOk(`Modal should be closed (iteration ${i + 1})`);
  }
});

test('Modal content is accessible', async t => {
  const modal = new ModalPage();
  
  // Open the modal
  await modal.openModal();
  
  // Get the modal content
  const content = await modal.getModalContent();
  
  // Verify content exists and contains expected text
  await t.expect(content.length).gt(0, 'Modal should have content');
  await t.expect(content).contains('Modal', 'Modal content should contain "Modal"');
});

test('Escape key closes modal', async t => {
  const modal = new ModalPage();
  
  // Open the modal
  await modal.openModal();
  
  // Verify it's open
  let isVisible = await modal.isModalVisible();
  await t.expect(isVisible).ok('Modal should be open');
  
  // Press Escape key
  await t.pressKey('esc');
  
  // Verify it's closed
  isVisible = await modal.isModalVisible();
  await t.expect(isVisible).notOk('Modal should be closed after pressing Escape');
});
